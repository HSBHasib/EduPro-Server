import { Request, Response } from "express";
import { DocumentSummary } from "../models/DocumentSummary.js";
import { generateDocumentSummary } from "../services/gemini.js";
import { AppError } from "../middleware/errorHandler.js";

export async function analyzeDocument(req: Request, res: Response): Promise<void> {
  const { content, fileName } = req.body;

  if (!content || content.length < 10) {
    throw new AppError("Document content is too short to analyze", 400);
  }

  try {
    const result = await generateDocumentSummary(content);

    const docSummary = await DocumentSummary.create({
      originalName: fileName,
      originalContent: content,
      summary: result.summary,
      actionItems: result.actionItems,
      keyTopics: result.keyTopics,
      wordCount: content.split(/\s+/).length,
    });

    res.json({
      success: true,
      data: {
        id: docSummary._id,
        summary: result.summary,
        actionItems: result.actionItems,
        keyTopics: result.keyTopics,
        wordCount: docSummary.wordCount,
        createdAt: docSummary.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze document";
    throw new AppError(message, 500);
  }
}

export async function getDocumentHistory(_req: Request, res: Response): Promise<void> {
  const documents = await DocumentSummary.find()
    .select("originalName summary wordCount createdAt")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({ success: true, data: documents });
}

export async function getDocumentById(req: Request, res: Response): Promise<void> {
  const doc = await DocumentSummary.findById(req.params.id).lean();

  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  res.json({ success: true, data: doc });
}

export async function deleteDocument(req: Request, res: Response): Promise<void> {
  const doc = await DocumentSummary.findByIdAndDelete(req.params.id);

  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  res.json({ success: true, message: "Document deleted" });
}