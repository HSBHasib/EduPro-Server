import { Router } from "express";
import itemsRouter from "./items.js";
import chatRouter from "./chat.js";
import documentsRouter from "./documents.js";

const router = Router();

router.use("/items", itemsRouter);
router.use("/chat", chatRouter);
router.use("/documents", documentsRouter);

export default router;