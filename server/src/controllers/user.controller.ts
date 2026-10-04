import { Request, Response } from "express";
import { User } from "../models/user";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    console.log(users, "users");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    await User.create({
  username: "testuser",
  email: "test@example.com",
  passwordHash: "dummy",
});
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};