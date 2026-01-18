const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ContentRequest = require('../models/ContentRequest');
const GeneratedVideo = require('../models/GeneratedVideo');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.modelsPath = process.env.MODELS_PATH || './models';
    this.outputPath = process.env.OUTPUT_PATH || './output';
    this.gpuEnabled = process.env.GPU_ENABLED === 'true';
  }

  async generateVideo(prompt, options = {}) {
    const { style = 'educational', duration = 300, resolution = '1080p' } = options;
    
    // Create a job ID for tracking
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create output directory for this job
    const jobOutputDir = path.join(this.outputPath, jobId);
    if (!fs.existsSync(jobOutputDir)) {
      fs.mkdirSync(jobOutputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      // Determine the appropriate model based on style
      let modelScript;
      switch (style) {
        case 'cinematic':
          modelScript = 'wan2_cinematic.py';
          break;
        case 'animation':
          modelScript = 'ltx2_animation.py';
          break;
        default:
          modelScript = 'wan2_educational.py';
      }

      // Prepare the AI model arguments
      const args = [
        modelScript,
        '--prompt', prompt,
        '--duration', duration.toString(),
        '--resolution', resolution,
        '--output_dir', jobOutputDir,
        '--gpu', this.gpuEnabled.toString()
      ];

      // Spawn the AI generation process
      const aiProcess = spawn('python3', args, {
        cwd: this.modelsPath,
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      aiProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        logger.info(`AI Process: ${data.toString()}`);
      });

      aiProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        logger.error(`AI Process Error: ${data.toString()}`);
      });

      aiProcess.on('close', (code) => {
        if (code === 0) {
          // Find the generated video file
          const videoFiles = fs.readdirSync(jobOutputDir).filter(file => 
            file.endsWith('.mp4') || file.endsWith('.avi') || file.endsWith('.mov')
          );

          if (videoFiles.length > 0) {
            const videoFile = videoFiles[0];
            const videoPath = path.join(jobOutputDir, videoFile);
            
            // Generate thumbnail
            const thumbnailPath = path.join(jobOutputDir, 'thumbnail.jpg');
            this.generateThumbnail(videoPath, thumbnailPath);
            
            resolve({
              videoPath,
              thumbnailPath,
              duration: this.estimateDuration(stdout),
              metadata: { style, resolution, prompt }
            });
          } else {
            reject(new Error('No video file generated'));
          }
        } else {
          reject(new Error(`AI process exited with code ${code}. Error: ${stderr}`));
        }
      });

      aiProcess.on('error', (err) => {
        reject(err);
      });
    });
  }

  generateThumbnail(videoPath, thumbnailPath) {
    // This would use FFmpeg to generate a thumbnail
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-ss', '00:00:01.000', // Take thumbnail at 1 second
      '-vframes', '1',
      thumbnailPath
    ]);

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        logger.error(`FFmpeg thumbnail generation failed with code ${code}`);
      }
    });
  }

  estimateDuration(output) {
    // Parse AI model output to estimate actual duration
    // This is a simplified implementation
    const match = output.match(/Duration:\s*(\d+:\d+:\d+)/);
    if (match) {
      const time = match[1];
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 300; // Default to 5 minutes
  }

  async processContentRequest(requestId) {
    const request = await ContentRequest.findById(requestId);
    if (!request) throw new Error('Request not found');

    try {
      // Update status to processing
      request.status = 'processing';
      await request.save();

      // Generate video using AI models
      const result = await this.generateVideo(request.topic, {
        style: request.style,
        duration: request.duration,
        resolution: '1080p'
      });

      // Create generated video record
      const generatedVideo = await GeneratedVideo.create({
        requestId: request._id,
        videoUrl: result.videoPath,
        thumbnailUrl: result.thumbnailPath,
        duration: result.duration,
        aiModelUsed: request.style,
        aiSettings: result.metadata,
        status: 'completed'
      });

      // Update request
      request.status = 'completed';
      request.video = generatedVideo._id;
      await request.save();

      logger.info(`Video generation completed for request ${requestId}`);
      return generatedVideo;
    } catch (error) {
      logger.error(`Video generation failed for request ${requestId}: ${error.message}`);
      
      // Update request status to failed
      request.status = 'failed';
      request.error = error.message;
      await request.save();
      
      throw error;
    }
  }
}

module.exports = new AIService();
