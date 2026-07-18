import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authenticateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Unauthorized: Session expired or invalid token.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token || token.length < 10) {
    res.status(401).json({
      success: false,
      error: "Unauthorized: Session expired or invalid token.",
    });
    return;
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({ success: false, error: "Database not connected" });
      return;
    }

    const session = await db.collection("session").findOne({ token });

    if (!session) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: Session expired or invalid token.",
      });
      return;
    }

    if (new Date(session.expiresAt) < new Date()) {
      await db.collection("session").deleteOne({ token });
      res.status(401).json({
        success: false,
        error: "Unauthorized: Session expired or invalid token.",
      });
      return;
    }

    req.userId = session.userId.toString();
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Unauthorized: Session expired or invalid token.",
    });
  }
}