import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";
import { config } from "../config/env.js";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getGenAI(): GenerativeModel {
  if (!model) {
    if (!config.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return model;
}

export async function* streamChat(
  message: string,
  history: Array<{ role: string; content: string }>,
  systemInstruction?: string
): AsyncGenerator<string, void, unknown> {
  const genModel = getGenAI();

  const chat = genModel.startChat({
    history: history.map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
    },
    systemInstruction: systemInstruction || "You are EduPro AI, a helpful educational assistant. Provide clear, concise, and accurate information to help students learn effectively.",
  });

  const result = await chat.sendMessageStream(message);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

export async function generateDocumentSummary(content: string): Promise<{
  summary: string;
  actionItems: string[];
  keyTopics: string[];
}> {
  const genModel = getGenAI();

  const prompt = `Analyze the following document and provide:
1. A comprehensive summary (2-4 paragraphs)
2. Key action items (bullet points)
3. Main topics covered (list)

Document:
${content}

Respond in JSON format:
{
  "summary": "...",
  "actionItems": ["...", "..."],
  "keyTopics": ["...", "..."]
}`;

  const result = await genModel.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    summary: parsed.summary || "",
    actionItems: parsed.actionItems || [],
    keyTopics: parsed.keyTopics || [],
  };
}

export function createChatHistory(
  messages: Array<{ role: string; content: string }>
): Array<{ role: string; content: string }> {
  return messages.slice(-20);
}