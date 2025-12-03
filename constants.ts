import { StylePreset, AspectRatio } from './types';

// Using the pro preview model as requested for high quality/consistent results
export const MODEL_NAME = 'gemini-3-pro-image-preview'; 

export const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string; description: string }[] = [
  { value: "1:1", label: "Square", icon: "square", description: "IG Feed, Profile Pics" },
  { value: "4:5", label: "IG Portrait", icon: "portrait", description: "Instagram Feed (Best Reach)" },
  { value: "9:16", label: "Story/Reel", icon: "smartphone", description: "TikTok, Reels, Stories" },
  { value: "16:9", label: "Landscape", icon: "monitor", description: "YouTube, Twitter, Facebook" },
  { value: "4:3", label: "Standard", icon: "image", description: "Blog Posts, Web Gallery" },
  { value: "3:4", label: "Vertical", icon: "book", description: "Pinterest, Editorial" },
];

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'none', label: 'Natural / No Filter', promptModifier: '' },
  { id: 'social-aesthetic', label: 'Insta Aesthetic', promptModifier: ', trending on social media, aesthetic, soft lighting, high quality, consistent color palette, influencer style, canon 5d, 50mm lens' },
  { id: 'photorealistic', label: 'Photorealistic', promptModifier: ', highly detailed, photorealistic, 8k resolution, cinematic lighting, professional photography, sharp focus, depth of field' },
  { id: 'studio-product', label: 'Studio Product', promptModifier: ', professional studio lighting, clean background, product photography, commercial quality, 4k, advertising standard' },
  { id: 'cinematic', label: 'Cinematic Movie', promptModifier: ', cinematic shot, movie scene, color graded, teal and orange, dramatic lighting, imax quality' },
  { id: 'anime', label: 'Anime / Manga', promptModifier: ', anime style, studio ghibli style, vibrant colors, detailed line art, character design, 2d animation' },
  { id: '3d-render', label: '3D Render', promptModifier: ', 3d render, unreal engine 5, octane render, ray tracing, volumetric lighting, hyperdetailed, cgi' },
  { id: 'cyberpunk', label: 'Cyberpunk', promptModifier: ', cyberpunk, neon lights, futuristic, high contrast, sci-fi, night time, blade runner style' },
  { id: 'minimalist', label: 'Minimalist', promptModifier: ', minimalist, flat design, vector art, clean lines, simple background, modern, less is more' },
];