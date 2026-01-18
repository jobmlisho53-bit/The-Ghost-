#!/usr/bin/env python3
"""
Chunk Manager for Video Generation
Handles video chunk generation, stitching, and FFmpeg operations
"""

import argparse
import os
import subprocess
import logging
import json
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_args():
    parser = argparse.ArgumentParser(description='Manage video chunks and FFmpeg operations')
    parser.add_argument('--input_dir', type=str, required=True, help='Input directory with video chunks')
    parser.add_argument('--output_path', type=str, required=True, help='Final output video path')
    parser.add_argument('--add_audio', type=str, help='Audio file to add')
    parser.add_argument('--add_effects', type=bool, default=False, help='Apply video effects')
    parser.add_argument('--resolution', type=str, default='1080p', help='Target resolution')
    return parser.parse_args()

def find_video_chunks(input_dir):
    """
    Find all video chunks in the input directory
    """
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv']
    chunks = []
    
    for file in Path(input_dir).iterdir():
        if file.suffix.lower() in video_extensions:
            chunks.append(str(file))
    
    # Sort chunks by name to maintain order
    chunks.sort()
    return chunks

def stitch_chunks_ffmpeg(chunks, output_path):
    """
    Stitch video chunks together using FFmpeg
    """
    try:
        if len(chunks) == 1:
            # Only one chunk, just copy it            cmd = ['ffmpeg', '-i', chunks[0], '-c', 'copy', output_path, '-y']
        else:
            # Multiple chunks, use concat demuxer
            # Create a temporary file listing all chunks
            concat_file = output_path.replace('.mp4', '_concat.txt')
            
            with open(concat_file, 'w') as f:
                for chunk in chunks:
                    f.write(f"file '{chunk}'\n")
            
            cmd = [
                'ffmpeg',
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_file,
                '-c', 'copy',
                output_path,
                '-y'
            ]
        
        logger.info(f"Running FFmpeg command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg failed: {result.stderr}")
        
        # Clean up concat file
        if os.path.exists(concat_file):
            os.remove(concat_file)
        
        logger.info(f"Successfully stitched {len(chunks)} chunks to {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error stitching chunks: {str(e)}")
        raise

def add_audio_to_video(video_path, audio_path, output_path):
    """
    Add audio track to video using FFmpeg
    """
    try:
        cmd = [
            'ffmpeg',
            '-i', video_path,
            '-i', audio_path,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-strict', 'experimental',
            output_path,            '-y'
        ]
        
        logger.info(f"Adding audio with FFmpeg: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Audio addition failed: {result.stderr}")
        
        logger.info(f"Successfully added audio to {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error adding audio: {str(e)}")
        raise

def apply_effects(video_path, output_path, effects_config=None):
    """
    Apply video effects using FFmpeg
    """
    try:
        cmd = ['ffmpeg', '-i', video_path]
        
        # Add effects based on configuration
        if effects_config:
            # Example: add fade-in/fade-out
            if effects_config.get('fade_in'):
                cmd.extend(['-vf', f"fade=t=in:st=0:d={effects_config['fade_in']}"])
            
            if effects_config.get('fade_out'):
                cmd.extend(['-vf', f"fade=t=out:st={effects_config['fade_out']['start']}:d={effects_config['fade_out']['duration']}"])
        
        cmd.extend([output_path, '-y'])
        
        logger.info(f"Applying effects with FFmpeg: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Effects application failed: {result.stderr}")
        
        logger.info(f"Successfully applied effects to {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error applying effects: {str(e)}")
        raise

def generate_thumbnail(video_path, thumbnail_path):
    """
    Generate thumbnail from video using FFmpeg    """
    try:
        cmd = [
            'ffmpeg',
            '-i', video_path,
            '-ss', '00:00:01.000',  # Take thumbnail at 1 second
            '-vframes', '1',
            thumbnail_path,
            '-y'
        ]
        
        logger.info(f"Generating thumbnail: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Thumbnail generation failed: {result.stderr}")
        
        logger.info(f"Thumbnail generated: {thumbnail_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error generating thumbnail: {str(e)}")
        raise

def main():
    args = parse_args()
    
    logger.info(f"Starting chunk management for directory: {args.input_dir}")
    
    try:
        # Find all video chunks
        chunks = find_video_chunks(args.input_dir)
        logger.info(f"Found {len(chunks)} video chunks")
        
        if not chunks:
            raise Exception("No video chunks found in input directory")
        
        # Create temp output for stitched video
        temp_output = args.output_path.replace('.mp4', '_temp.mp4')
        
        # Stitch chunks together
        stitch_chunks_ffmpeg(chunks, temp_output)
        
        # Apply effects if requested
        final_output = temp_output
        if args.add_effects:
            effects_config = {
                'fade_in': 1.0,
                'fade_out': {'start': 29.0, 'duration': 1.0}  # Assuming 30-second video
            }            effects_output = args.output_path.replace('.mp4', '_effects.mp4')
            apply_effects(temp_output, effects_output, effects_config)
            final_output = effects_output
        
        # Add audio if provided
        if args.add_audio:
            audio_output = args.output_path
            add_audio_to_video(final_output, args.add_audio, audio_output)
        else:
            # Just rename/move the final output
            os.rename(final_output, args.output_path)
        
        # Generate thumbnail
        thumbnail_path = args.output_path.replace('.mp4', '.jpg')
        generate_thumbnail(args.output_path, thumbnail_path)
        
        # Create metadata
        metadata = {
            "operation": "chunk_management",
            "input_chunks": len(chunks),
            "input_directory": args.input_dir,
            "output_file": args.output_path,
            "thumbnail": thumbnail_path,
            "resolution": args.resolution,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        metadata_path = args.output_path.replace('.mp4', '_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Chunk management completed successfully!")
        logger.info(f"Final video: {args.output_path}")
        logger.info(f"Thumbnail: {thumbnail_path}")
        logger.info(f"Meta {metadata_path}")
        
        # Print completion message for parent process
        print(f"SUCCESS: Video processing completed at {args.output_path}")
        
    except Exception as e:
        logger.error(f"Chunk management failed: {str(e)}")
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
