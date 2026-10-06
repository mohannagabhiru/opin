import { Request, Response } from "express";

import {
  registerUser,
  loginUser,
} from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { User } from "../models/user";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, email, password } = req.body;

    const user = await registerUser(
      username,
      email,
      password
    );

    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Registration failed",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken } = await loginUser(
      email,
      password
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  return res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $set: {
        activeSessionId: null,
      },
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};