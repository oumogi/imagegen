import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from '../constants';
import { AspectRatio } from '../types';

// Helper to access the window.aistudio object for key selection
// We define a local interface to type the aistudio object when casting
interface AIStudioClient {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

/**
 * Checks if the user has selected an API key via the AI Studio overlay
 * OR if the API key is available in the environment variables (Netlify/Production).
 */
export const checkApiKey = async (): Promise<boolean> => {
  // 1. Production/Netlify check: Is the key baked in via Vite define?
  if (process.env.API_KEY && process.env.API_KEY.length > 0) {
    return true;
  }

  // 2. Playground/Dev check: AI Studio Overlay
  const aistudio = (window as any).aistudio as AIStudioClient | undefined;
  if (aistudio && aistudio.hasSelectedApiKey) {
    return await aistudio.hasSelectedApiKey();
  }
  return false;
};

/**
 * Opens the API key selection dialog.
 * Only works in the AI Studio environment.
 */
export const requestApiKey = async (): Promise<void> => {
  const aistudio = (window as any).aistudio as AIStudioClient | undefined;
  if (aistudio && aistudio.openSelectKey) {
    await aistudio.openSelectKey();
  } else {
    console.warn("AI Studio overlay not found. Ensure API_KEY is set in environment variables for production.");
  }
};

/**
 * Generates a single image using Gemini 3 Pro.
 * We wrap this to run in parallel for the "4 images" requirement.
 */
const generateSingleImage = async (
  prompt: string, 
  aspectRatio: AspectRatio
): Promise<string | null> => {
  try {
    // CRITICAL: Create instance right before call to ensure we have the latest key from environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K", // High quality for social media
        },
      },
    });

    // Parse response to find image part
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Generation error:", error);
    // If resource not found (404), it might mean the key is invalid or not selected properly for this model
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        throw new Error("AUTH_ERROR");
    }
    return null;
  }
};

/**
 * Main service function to generate 4 images in parallel.
 */
export const generateImageBatch = async (
  basePrompt: string,
  styleModifier: string,
  aspectRatio: AspectRatio,
  count: number = 4
): Promise<string[]> => {
  
  const fullPrompt = `${basePrompt} ${styleModifier}`.trim();
  
  // Create an array of promises to execute in parallel
  const promises = Array.from({ length: count }).map(() => 
    generateSingleImage(fullPrompt, aspectRatio)
  );

  const results = await Promise.all(promises);

  // Filter out nulls (failed generations)
  return results.filter((res): res is string => res !== null);
};