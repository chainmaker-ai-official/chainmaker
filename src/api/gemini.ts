import { GoogleGenAI } from "@google/genai";

export async function sendMessageToGemini(message: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response text received from Gemini API');
    }
    
    return text;
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw error;
  }
}
