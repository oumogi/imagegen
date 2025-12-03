export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "4:5";

export interface ImageResult {
  id: string;
  dataUrl: string; // base64 data uri
  prompt: string;
  aspectRatio: AspectRatio;
  createdAt: number;
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio: AspectRatio;
  stylePreset: string;
  numberOfImages: number;
}

export interface StylePreset {
  id: string;
  label: string;
  promptModifier: string;
}