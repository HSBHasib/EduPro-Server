import { Router } from "express";
import {
  analyzeDocument,
  getDocumentHistory,
  getDocumentById,
  deleteDocument,
} from "../controllers/documents.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { documentUploadSchema, idParamSchema } from "../types/schemas.js";

const router = Router();

router.post("/analyze", validate(documentUploadSchema), asyncHandler(analyzeDocument));
router.get("/history", asyncHandler(getDocumentHistory));
router.get("/:id", validate(idParamSchema), asyncHandler(getDocumentById));
router.delete("/:id", validate(idParamSchema), asyncHandler(deleteDocument));

export default router;