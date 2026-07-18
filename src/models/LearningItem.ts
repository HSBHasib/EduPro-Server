import mongoose, { Schema, Document } from "mongoose";

export interface ILearningItem extends Document {
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  content: string;
  author: string;
  tags: string[];
  thumbnailUrl?: string;
  sourceUrl?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const learningItemSchema = new Schema<ILearningItem>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    thumbnailUrl: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

learningItemSchema.index({ title: "text", description: "text", tags: "text" });
learningItemSchema.index({ category: 1, priority: 1 });
learningItemSchema.index({ createdAt: -1 });

export const LearningItem = mongoose.model<ILearningItem>("LearningItem", learningItemSchema);