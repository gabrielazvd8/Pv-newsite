
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    // Initialize Gemini API client using API_KEY from environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Generate content using gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crie uma descrição profissional para a camisa: ${prompt}`,
      config: {
        systemInstruction: "Você é um especialista em marketing esportivo de luxo. Crie descrições curtas, profissionais e comerciais para camisas esportivas. Foque em qualidade, estilo de elite e paixão pelo esporte.",
        temperature: 0.7,
      },
    });

    // Extract text directly from response property
    res.status(200).json({ text: response.text });
  } catch (err) {
    console.error("Gemini AI Error:", err);
    res.status(500).json({ error: "Erro ao gerar descrição com Gemini" });
  }
}
