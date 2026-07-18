import { Router } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getCategories,
  getStats,
  getMyItems,
  getMyStats,
} from "../controllers/learningItems.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { authenticateSession } from "../middleware/authenticateSession.js";
import {
  createItemSchema,
  updateItemSchema,
  queryItemsSchema,
  idParamSchema,
} from "../types/schemas.js";

const router = Router();

// Public routes
router.get("/stats", asyncHandler(getStats));
router.get("/categories", asyncHandler(getCategories));
router.get("/mine/stats", authenticateSession, asyncHandler(getMyStats));
router.get("/mine", authenticateSession, asyncHandler(getMyItems));
router.get("/", validate(queryItemsSchema), asyncHandler(getItems));
router.get("/:id", validate(idParamSchema), asyncHandler(getItemById));

// Protected routes (require authentication)
router.post("/", authenticateSession, validate(createItemSchema), asyncHandler(createItem));
router.put("/:id", authenticateSession, validate(updateItemSchema), asyncHandler(updateItem));
router.delete("/:id", authenticateSession, validate(idParamSchema), asyncHandler(deleteItem));

export default router;