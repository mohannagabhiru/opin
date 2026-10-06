import {
  Request,
  Response,
  NextFunction,
} from "express";

import { User } from "../models/user";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub)
      .select("+activeSessionId");

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (
      !user.activeSessionId ||
      user.activeSessionId !== payload.sessionId
    ) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    req.userId = user._id.toString();

    next();
  } catch {
    return res.status(401).json({
      message: "Authentication required",
    });
  }
};