import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  sessionId: string;
  title: string;
  messages: IChatMessage[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ["user", "model"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    title: { type: String, default: "New Chat" },
    messages: [chatMessageSchema],
    context: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({ updatedAt: -1 });

export const ChatSession = mongoose.model<IChatSession>("ChatSession", chatSessionSchema);