import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import locationRoutes from "./routes/location.routes";
import opinionRoutes from "./routes/opinion.routes";

const app = express();
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }))
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "API is running"
  });
});

app.use(cookieParser());
app.use("/api",userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/locations", locationRoutes);
app.use("/api/opinions", opinionRoutes);

export default app;