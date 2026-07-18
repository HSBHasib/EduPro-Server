import { Router } from "express";
import {
  streamChatMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
} from "../controllers/chat.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { chatMessageSchema } from "../types/schemas.js";

const router = Router();

router.post("/stream", validate(chatMessageSchema), asyncHandler(streamChatMessage));
router.get("/sessions", asyncHandler(getChatSessions));
router.get("/sessions/:sessionId", asyncHandler(getChatSession));
router.delete("/sessions/:sessionId", asyncHandler(deleteChatSession));

export default router;