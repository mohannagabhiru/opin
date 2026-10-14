
import type { Request, Response } from "express";
import {
  createOpinionSchema,
  opinionFeedSchema,
} from "../validators/opinion.validator";
import {
  createOpinion,
  getMyOpinions,
  getPublicOpinionFeed,
} from "../services/opinion.service";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    userId?: string;
  };
};

function getUserId(req: Request): string | null {
  const user = (req as AuthenticatedRequest).user;
  return user?.userId ?? user?.id ?? null;
}

export async function createOpinionController(
  req: Request,
  res: Response
): Promise<void> {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      },
    });
    return;
  }

  const parsed = createOpinionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "INVALID_OPINION",
        message: parsed.error.issues[0]?.message,
      },
    });
    return;
  }

  try {
    const opinion = await createOpinion({
      authorId: userId,
      text: parsed.data.content.text,
      selectionToken: parsed.data.location.selectionToken,
    });

    res.status(201).json({
      opinion: {
        id: opinion._id.toString(),
        authorId: opinion.authorId.toString(),
        content: opinion.content,
        location: opinion.location,
        status: opinion.status,
        createdAt: opinion.createdAt,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_LOCATION_SELECTION"
    ) {
      res.status(422).json({
        error: {
          code: "INVALID_LOCATION_SELECTION",
          message:
            "Your selected location has expired. Search and select it again.",
        },
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_AUTHOR_ID"
    ) {
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Invalid authenticated user.",
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: "OPINION_CREATION_FAILED",
        message: "Unable to create opinion.",
      },
    });
  }
}

export async function getOpinionFeedController(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = opinionFeedSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "INVALID_FEED_QUERY",
        message: "Invalid pagination parameters.",
      },
    });
    return;
  }

  try {
    const feed = await getPublicOpinionFeed(parsed.data);
    res.status(200).json(feed);
  } catch {
    res.status(500).json({
      error: {
        code: "FEED_FETCH_FAILED",
        message: "Unable to load opinions.",
      },
    });
  }
}

export async function getMyOpinionsController(
  req: Request,
  res: Response
): Promise<void> {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      },
    });
    return;
  }

  const parsed = opinionFeedSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "INVALID_FEED_QUERY",
        message: "Invalid pagination parameters.",
      },
    });
    return;
  }

  try {
    const feed = await getMyOpinions({
      authorId: userId,
      ...parsed.data,
    });

    res.status(200).json(feed);
  } catch {
    res.status(500).json({
      error: {
        code: "MY_OPINIONS_FETCH_FAILED",
        message: "Unable to load your opinions.",
      },
    });
  }
}
