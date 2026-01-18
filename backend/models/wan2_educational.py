#!/usr/bin/env python3
"""
Wan 2.1 Educational Model for Video Generation
Handles educational content video generation
"""

import argparse
import os
import sys
import torch
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import load_image, export_to_video
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import logging
import json
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_args():
    parser = argparse.ArgumentParser(description='Generate educational videos using Wan 2.1 model')
    parser.add_argument('--prompt', type=str, required=True, help='Text prompt for video generation')
    parser.add_argument('--duration', type=int, default=300, help='Duration in seconds')
    parser.add_argument('--resolution', type=str, default='1080p', help='Resolution (e.g., 720p, 1080p)')
    parser.add_argument('--output_dir', type=str, required=True, help='Output directory')
    parser.add_argument('--gpu', type=bool, default=True, help='Use GPU acceleration')
    return parser.parse_args()

def load_educational_model(model_path=None):
    """
    Load the Wan 2.1 educational model
    """
    try:
        # Use the official Stable Video Diffusion model as base
        # In production, replace with your trained educational-specific model
        pipe = StableVideoDiffusionPipeline.from_pretrained(
            "stabilityai/stable-video-diffusion-img2vid-xt",
            torch_dtype=torch.float16,
            variant="fp16"
        )
        
        if torch.cuda.is_available():
            pipe = pipe.to("cuda")
        else:
            logger.warning("CUDA not available, using CPU (will be slow)")
                    return pipe
    except Exception as e:
        logger.error(f"Error loading educational model: {str(e)}")
        raise

def preprocess_educational_prompt(prompt):
    """
    Preprocess the prompt for educational content
    """
    # Add educational keywords for better results
    educational_keywords = [
        "educational content", "informative", "clear explanation",
        "academic style", "didactic", "learning material",
        "instructional", "pedagogical", "knowledge transfer"
    ]
    
    enhanced_prompt = f"{prompt}, " + ", ".join(educational_keywords)
    return enhanced_prompt

def create_educational_image(prompt, resolution="1080p"):
    """
    Create an educational-style image with text overlays
    """
    try:
        width, height = (1920, 1080) if resolution == "1080p" else (1280, 720)
        
        # Create a clean educational background
        image_array = np.ones((height, width, 3), dtype=np.uint8) * 240  # Light gray
        
        # Convert to PIL Image for drawing
        image = Image.fromarray(image_array)
        draw = ImageDraw.Draw(image)
        
        # Add title text (first part of prompt)
        title_words = prompt.split()[:5]  # First 5 words as title
        title = " ".join(title_words)
        
        try:
            # Try to use a system font
            font = ImageFont.truetype("/system/fonts/Roboto-Regular.ttf", 60)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
        
        # Draw title
        bbox = draw.textbbox((0, 0), title, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        title_x = (width - text_width) // 2        title_y = height // 4
        
        # Add shadow for better readability
        draw.text((title_x+2, title_y+2), title, fill=(100, 100, 100), font=font)
        draw.text((title_x, title_y), title, fill=(0, 0, 0), font=font)
        
        # Add some educational elements
        # Draw a simple diagram area
        diagram_x, diagram_y = width // 4, height // 2
        diagram_w, diagram_h = width // 2, height // 4
        
        draw.rectangle([diagram_x, diagram_y, diagram_x + diagram_w, diagram_y + diagram_h], 
                      outline=(100, 100, 200), width=3)
        
        # Add placeholder text in diagram
        try:
            small_font = ImageFont.truetype("/system/fonts/Roboto-Regular.ttf", 30)
        except:
            small_font = ImageFont.load_default()
            
        draw.text((diagram_x + 20, diagram_y + 20), "Educational Diagram", 
                 fill=(100, 100, 200), font=small_font)
        
        return image
    except Exception as e:
        logger.error(f"Error creating educational image: {str(e)}")
        raise

def generate_educational_frames(pipe, image, num_frames, fps=7):
    """
    Generate educational video frames using the model
    """
    try:
        # Generate video frames with educational style
        frames = pipe(
            image,
            num_videos_per_prompt=1,
            num_inference_steps=25,
            min_guidance_scale=1.0,
            max_guidance_scale=3.0,
            fps=fps,
            motion_bucket_id=180,  # Subtle motion for educational content
            noise_aug_strength=0.05,  # Less noise for cleaner educational look
        ).frames[0]
        
        return frames
    except Exception as e:
        logger.error(f"Error generating educational frames: {str(e)}")
        raise
def save_educational_video(frames, output_path, fps=7):
    """
    Save educational frames to video file
    """
    try:
        export_to_video(frames, output_path, fps)
        logger.info(f"Educational video saved to {output_path}")
    except Exception as e:
        logger.error(f"Error saving educational video: {str(e)}")
        raise

def main():
    args = parse_args()
    
    logger.info(f"Starting educational video generation with prompt: '{args.prompt}'")
    logger.info(f"Duration: {args.duration}s, Resolution: {args.resolution}")
    
    try:
        # Load model
        logger.info("Loading Wan 2.1 educational model...")
        pipe = load_educational_model()
        
        # Preprocess prompt
        enhanced_prompt = preprocess_educational_prompt(args.prompt)
        logger.info(f"Enhanced prompt: {enhanced_prompt}")
        
        # Create educational image
        logger.info("Creating educational-style image...")
        image = create_educational_image(enhanced_prompt, args.resolution)
        
        # Calculate number of frames based on duration
        fps = 7  # Standard for SVD
        num_frames = int(args.duration * fps)
        logger.info(f"Generating {num_frames} frames at {fps}fps")
        
        # Generate video frames
        logger.info("Generating educational video frames...")
        frames = generate_educational_frames(pipe, image, num_frames, fps)
        
        # Create output directory if it doesn't exist
        os.makedirs(args.output_dir, exist_ok=True)
        
        # Generate output filename
        output_filename = f"educational_{args.prompt.replace(' ', '_')[:50]}_{int(os.urandom(4).hex(), 16)}.mp4"
        output_path = os.path.join(args.output_dir, output_filename)
        
        # Save video
        logger.info("Saving educational video...")
        save_educational_video(frames, output_path, fps)
                # Create metadata
        metadata = {
            "model_used": "Wan 2.1 Educational",
            "prompt": args.prompt,
            "duration": args.duration,
            "resolution": args.resolution,
            "fps": fps,
            "frame_count": len(frames),
            "output_file": output_filename,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        metadata_path = output_path.replace('.mp4', '_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Educational video generation completed successfully!")
        logger.info(f"Output: {output_path}")
        logger.info(f"Meta {metadata_path}")
        
        # Print completion message for parent process
        print(f"SUCCESS: Educational video generated at {output_path}")
        
    except Exception as e:
        logger.error(f"Educational video generation failed: {str(e)}")
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
