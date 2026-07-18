import { z } from "zod";

export const createItemSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    category: z.string().min(1),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    content: z.string().min(1),
    author: z.string().min(1),
    tags: z.array(z.string()).optional().default([]),
    thumbnailUrl: z.union([z.string().url(), z.literal("")]).optional().default(""),
    sourceUrl: z.union([z.string().url(), z.literal("")]).optional().default(""),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format") }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    category: z.string().min(1).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    content: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    thumbnailUrl: z.union([z.string().url(), z.literal("")]).optional(),
    sourceUrl: z.union([z.string().url(), z.literal("")]).optional(),
  }),
});

export const queryItemsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  }),
});

export const chatMessageSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1),
    message: z.string().min(1).max(5000),
    context: z.string().optional(),
  }),
});

export const documentUploadSchema = z.object({
  body: z.object({
    content: z.string().min(10, "Document content too short"),
    fileName: z.string().min(1),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format") }),
});