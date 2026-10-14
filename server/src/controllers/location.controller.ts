
import type { Request, Response } from "express";
import { locationSearchSchema } from "../validators/location.validator";
import { searchLocations } from "../services/location.service";

export async function searchLocationsController(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = locationSearchSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "INVALID_LOCATION_QUERY",
        message: parsed.error.issues[0]?.message,
      },
    });
    return;
  }

  try {
    const locations = await searchLocations(parsed.data.q);

    res.status(200).json({
      locations,
      attribution: "© OpenStreetMap contributors",
    });
  } catch {
    res.status(502).json({
      error: {
        code: "LOCATION_SEARCH_UNAVAILABLE",
        message: "Location search is temporarily unavailable.",
      },
    });
  }
}
