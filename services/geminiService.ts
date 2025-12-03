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
 * Checks if the user has selected an API key via the AI Studio overlay.
 */
export const checkApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio as AIStudioClient | undefined;
  if (aistudio && aistudio.hasSelectedApiKey) {
    return await aistudio.hasSelectedApiKey();
  }
  return false;
};

/**
 * Opens the API key selection dialog.
 */
export const requestApiKey = async (): Promise<void> => {
  const aistudio = (window as any).aistudio as AIStudioClient | undefined;
  if (aistudio && aistudio.openSelectKey) {
    await aistudio.openSelectKey();
  } else {
    console.error("AI Studio overlay not found");
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