import { Request, Response } from "express";
import { LearningItem, ILearningItem } from "../models/LearningItem.js";
import { AppError } from "../middleware/errorHandler.js";
import { AuthenticatedRequest } from "../middleware/authenticateSession.js";

export async function createItem(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  const item = await LearningItem.create({ ...req.body, userId: authReq.userId });
  res.status(201).json({ success: true, data: item });
}

export async function getItems(req: Request, res: Response): Promise<void> {
  const { search, category, priority, page = 1, limit = 12 } = req.query;

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$text = { $search: search as string };
  }
  if (category) {
    filter.category = category;
  }
  if (priority) {
    filter.priority = priority;
  }

  const skip = ((page as number) - 1) * (limit as number);

  const [items, total] = await Promise.all([
    LearningItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit as number)
      .lean(),
    LearningItem.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / (limit as number)),
    },
  });
}

export async function getItemById(req: Request, res: Response): Promise<void> {
  const item = await LearningItem.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  const relatedItems = await LearningItem.find({
    _id: { $ne: item._id },
    category: item.category,
  })
    .limit(4)
    .lean();

  res.json({ success: true, data: { item, relatedItems } });
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  const item = await LearningItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  res.json({ success: true, data: item });
}

export async function deleteItem(req: Request, res: Response): Promise<void> {
  const item = await LearningItem.findByIdAndDelete(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  res.json({ success: true, message: "Item deleted successfully" });
}

export async function getCategories(_req: Request, res: Response): Promise<void> {
  const categories = await LearningItem.distinct("category");
  res.json({ success: true, data: categories });
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [totalItems, totalViews, categories, recentItems] = await Promise.all([
    LearningItem.countDocuments(),
    LearningItem.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]),
    LearningItem.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    LearningItem.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  res.json({
    success: true,
    data: {
      totalItems,
      totalViews: totalViews[0]?.total || 0,
      categories,
      recentItems,
    },
  });
}

export async function getMyItems(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  const { page = 1, limit = 100 } = req.query;
  const skip = ((page as number) - 1) * (limit as number);

  const [items, total] = await Promise.all([
    LearningItem.find({ userId: authReq.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit as number)
      .lean(),
    LearningItem.countDocuments({ userId: authReq.userId }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / (limit as number)),
    },
  });
}

export async function getMyStats(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.userId;

  const [totalItems, totalViews, categories, monthlyItems, priorityBreakdown, recentItems] =
    await Promise.all([
      LearningItem.countDocuments({ userId }),
      LearningItem.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$viewCount" } } },
      ]),
      LearningItem.aggregate([
        { $match: { userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      LearningItem.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
      LearningItem.aggregate([
        { $match: { userId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      LearningItem.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = monthlyItems.map((item: { _id: { year: number; month: number }; count: number }) => ({
    name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    items: item.count,
  }));

  const priorityData = priorityBreakdown.map((item: { _id: string; count: number }) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
  }));

  res.json({
    success: true,
    data: {
      totalItems,
      totalViews: totalViews[0]?.total || 0,
      categories,
      monthlyData,
      priorityData,
      recentItems,
    },
  });
}