
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { searchLocationsController } from "../controllers/location.controller";

const router = Router();

const locationSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "LOCATION_SEARCH_RATE_LIMITED",
      message: "Too many location searches. Try again later.",
    },
  },
});

router.get(
  "/search",
  locationSearchLimiter,
  searchLocationsController
);

export default router;
