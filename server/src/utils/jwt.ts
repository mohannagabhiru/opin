import jwt from "jsonwebtoken";

interface JwtPayload {
  sub: string;
  sessionId: string;
}

export const generateAccessToken = (
  userId: string,
  sessionId: string
): string => {
  return jwt.sign(
    {
      sessionId,
    },
    process.env.JWT_SECRET!,
    {
      subject: userId,
      expiresIn: "7d",
    }
  );
};

export const verifyAccessToken = (
  token: string
): JwtPayload => {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as jwt.JwtPayload & {
    sessionId?: string;
  };

  if (
    typeof decoded.sub !== "string" ||
    typeof decoded.sessionId !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    sessionId: decoded.sessionId,
  };
};