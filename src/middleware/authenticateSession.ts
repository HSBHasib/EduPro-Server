import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

function extractToken(req: Request): string | null {
  // 1. Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // 2. Check cookies (BetterAuth HTTP-only cookie)
  const cookies = req.headers.cookie || "";
  const cookiePairs = cookies.split(";");
  for (const pair of cookiePairs) {
    const [name, rawValue] = pair.trim().split("=");
    if (
      name === "better-auth.session_token" ||
      name === "__Secure-better-auth.session_token"
    ) {
      if (!rawValue) return null;
      // BetterAuth cookie format: "token.signature" — extract just the token part
      const token = decodeURIComponent(rawValue).split(".")[0];
      return token || null;
    }
  }

  return null;
}

export async function authenticateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

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