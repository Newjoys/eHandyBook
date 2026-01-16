
import { GoogleGenAI, Type } from "@google/genai";

// Initialize with the environment variable directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateJournalText = async (topic: string, type: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a creative short title (under 5 words) and a poetic 1-sentence description for a travel scrapbook item of type "${type}" about "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });

    // Use the .text property directly
    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini suggestion failed:", error);
    return null;
  }
};

export const modifyStickerWithAI = async (imageData: string, instruction: string) => {
  try {
    // For image modification, we use the vision-capable model gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { data: imageData.split(',')[1], mimeType: 'image/png' } },
          { text: `Edit this sticker according to this instruction: "${instruction}". Keep the style as a clean flat vector sticker suitable for a digital scrapbook. Return the modified image as the primary output.` }
        ]
      }
    });

    // Iterate through parts to find the image part
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Sticker modification failed:", error);
    return null;
  }
};
