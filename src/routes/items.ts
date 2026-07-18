import { Router } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getCategories,
  getStats,
} from "../controllers/learningItems.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  createItemSchema,
  updateItemSchema,
  queryItemsSchema,
  idParamSchema,
} from "../types/schemas.js";

const router = Router();

router.get("/stats", asyncHandler(getStats));
router.get("/categories", asyncHandler(getCategories));
router.get("/", validate(queryItemsSchema), asyncHandler(getItems));
router.post("/", validate(createItemSchema), asyncHandler(createItem));
router.get("/:id", validate(idParamSchema), asyncHandler(getItemById));
router.put("/:id", validate(updateItemSchema), asyncHandler(updateItem));
router.delete("/:id", validate(idParamSchema), asyncHandler(deleteItem));

export default router;