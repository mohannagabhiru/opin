import argon2 from "argon2";
import { User } from "../models/user";
import { generateSessionId } from "../utils/session";
import { generateAccessToken } from "../utils/jwt";

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await argon2.hash(password);

  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    passwordHash,
    activeSessionId: null,
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+passwordHash +activeSessionId");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await argon2.verify(
    user.passwordHash,
    password
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate a completely new session.
  const sessionId = generateSessionId();

  // Replace the previous active session.
  user.activeSessionId = sessionId;

  await user.save();

  const accessToken = generateAccessToken(
    user._id.toString(),
    sessionId
  );

  return {
    user,
    accessToken,
  };
};