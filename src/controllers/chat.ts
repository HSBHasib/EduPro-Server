import { Request, Response } from "express";
import { ChatSession } from "../models/ChatSession.js";
import { streamChat, createChatHistory } from "../services/gemini.js";
import { AppError } from "../middleware/errorHandler.js";

export async function streamChatMessage(req: Request, res: Response): Promise<void> {
  const { sessionId, message, context } = req.body;

  let session = await ChatSession.findOne({ sessionId });

  if (!session) {
    session = await ChatSession.create({
      sessionId,
      title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
      messages: [],
      context,
    });
  }

  session.messages.push({
    role: "user",
    content: message,
    timestamp: new Date(),
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  let fullResponse = "";

  try {
    const history = createChatHistory(
      session.messages.map((m) => ({ role: m.role, content: m.content }))
    );

    const systemInstruction = context
      ? `You are EduPro AI, an educational assistant. Context: ${context}. Help students learn effectively with clear, accurate information.`
      : "You are EduPro AI, a helpful educational assistant. Provide clear, concise, and accurate information to help students learn effectively.";

    for await (const chunk of streamChat(message, history.slice(0, -1), systemInstruction)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    session.messages.push({
      role: "model",
      content: fullResponse,
      timestamp: new Date(),
    });

    await session.save();

    res.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
    res.end();
  } catch (error) {
    console.error("[Chat] Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
    res.end();
  }
}

export async function getChatSessions(_req: Request, res: Response): Promise<void> {
  const sessions = await ChatSession.find()
    .select("sessionId title createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  res.json({ success: true, data: sessions });
}

export async function getChatSession(req: Request, res: Response): Promise<void> {
  const session = await ChatSession.findOne({ sessionId: req.params.sessionId }).lean();

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  res.json({ success: true, data: session });
}

export async function deleteChatSession(req: Request, res: Response): Promise<void> {
  const session = await ChatSession.findOneAndDelete({ sessionId: req.params.sessionId });

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  res.json({ success: true, message: "Session deleted" });
}