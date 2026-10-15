
import { Router } from "express";
import rateLimit from "express-rate-limit";

import {requireAuth} from "../middleware/auth.middleware";
import {
  createOpinionController,
  getOpinionFeedController,
  getMyOpinionsController,
} from "../controllers/opinion.controller";

const router = Router();

const createOpinionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.get("/", getOpinionFeedController);

router.get(
  "/mine",
  requireAuth,
  getMyOpinionsController
);

router.post(
  "/",
  requireAuth,
  createOpinionLimiter,
  createOpinionController
);

export default router;
