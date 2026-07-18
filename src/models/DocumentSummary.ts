import mongoose, { Schema, Document } from "mongoose";

export interface IDocumentSummary extends Document {
  originalName: string;
  originalContent: string;
  summary: string;
  actionItems: string[];
  keyTopics: string[];
  wordCount: number;
  createdAt: Date;
}

const documentSummarySchema = new Schema<IDocumentSummary>(
  {
    originalName: { type: String, required: true },
    originalContent: { type: String, required: true },
    summary: { type: String, required: true },
    actionItems: [{ type: String }],
    keyTopics: [{ type: String }],
    wordCount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

documentSummarySchema.index({ createdAt: -1 });

export const DocumentSummary = mongoose.model<IDocumentSummary>("DocumentSummary", documentSummarySchema);