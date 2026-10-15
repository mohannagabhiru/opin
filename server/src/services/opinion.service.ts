import { Types } from "mongoose";
import { OpinionModel } from "../models/Opinion";
import type { CreateOpinionInput } from "../validators/opinion.validator";

interface FeedOptions {
  limit: number;
  cursor?: string;
  authorId?: string;
}

interface FeedCursor {
  createdAt: string;
  id: string;
}

export class OpinionServiceError extends Error {
  constructor(
    public readonly code:
      | "INVALID_AUTHOR_ID"
      | "INVALID_CURSOR",
  ) {
    super(code);
    this.name = "OpinionServiceError";
  }
}

export async function createOpinion(
  input: CreateOpinionInput & { authorId: string },
) {
  if (!Types.ObjectId.isValid(input.authorId)) {
    throw new OpinionServiceError("INVALID_AUTHOR_ID");
  }

  const text = input.content.text.trim();

  if (!text || text.length > 5000) {
    throw new Error("INVALID_OPINION_TEXT");
  }

  const location = input.location;
  const displayName = location.displayName
    .trim()
    .replace(/\s+/g, " ");

  const normalizedName = displayName
    .normalize("NFKC")
    .toLocaleLowerCase("en");

  const opinion = await OpinionModel.create({
    authorId: new Types.ObjectId(input.authorId),

    content: {
      text,
    },

    location: {
      displayName,
      normalizedName,
      countryCode: location.countryCode,
      region: location.region,
      city: location.city,
      osmType: location.osmType,
      osmId: location.osmId,

      geo: {
        type: "Point",
        coordinates: [
          location.longitude,
          location.latitude,
        ],
      },
    },

    status: "published",
  });

  return opinion;
}

function encodeCursor(opinion: {
  createdAt: Date;
  _id: Types.ObjectId;
}): string {
  const cursor: FeedCursor = {
    createdAt: opinion.createdAt.toISOString(),
    id: opinion._id.toString(),
  };

  return Buffer.from(
    JSON.stringify(cursor),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(
  cursor: string,
): FeedCursor | null {
  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      typeof decoded !== "object" ||
      decoded === null
    ) {
      return null;
    }

    const candidate = decoded as Record<string, unknown>;

    if (
      typeof candidate.createdAt !== "string" ||
      typeof candidate.id !== "string"
    ) {
      return null;
    }

    const timestamp = Date.parse(candidate.createdAt);

    if (!Number.isFinite(timestamp)) {
      return null;
    }

    if (!Types.ObjectId.isValid(candidate.id)) {
      return null;
    }

    const id = new Types.ObjectId(candidate.id);

    if (id.toString() !== candidate.id.toLowerCase()) {
      return null;
    }

    return {
      createdAt: new Date(timestamp).toISOString(),
      id: id.toString(),
    };
  } catch {
    return null;
  }
}

async function getFeed(options: FeedOptions) {
  const { limit } = options;

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error("INVALID_FEED_LIMIT");
  }

  const filter: Record<string, unknown> = {
    status: "published",
  };

  if (options.authorId) {
    if (!Types.ObjectId.isValid(options.authorId)) {
      throw new OpinionServiceError("INVALID_AUTHOR_ID");
    }

    filter.authorId = new Types.ObjectId(options.authorId);
  }

  if (options.cursor) {
    const cursor = decodeCursor(options.cursor);

    if (!cursor) {
      throw new OpinionServiceError("INVALID_CURSOR");
    }

    const cursorDate = new Date(cursor.createdAt);
    const cursorId = new Types.ObjectId(cursor.id);

    filter.$or = [
      { createdAt: { $lt: cursorDate } },
      {
        createdAt: cursorDate,
        _id: { $lt: cursorId },
      },
    ];
  }

  const documents = await OpinionModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select(
      "_id authorId content location status createdAt updatedAt",
    )
    .lean()
    .exec();

  const hasMore = documents.length > limit;
  const items = documents.slice(0, limit);
  const lastItem = items.at(-1);

  return {
    items: items.map((opinion) => ({
      id: opinion._id.toString(),
      authorId: opinion.authorId.toString(),

      content: {
        text: opinion.content.text,
      },

      location: {
        displayName: opinion.location.displayName,
        normalizedName: opinion.location.normalizedName,
        countryCode: opinion.location.countryCode,
        region: opinion.location.region,
        city: opinion.location.city,
        geo: opinion.location.geo,
      },

      status: opinion.status,
      createdAt: opinion.createdAt,
      updatedAt: opinion.updatedAt,
    })),

    nextCursor:
      hasMore && lastItem
        ? encodeCursor(lastItem)
        : null,
  };
}

export function getPublicOpinionFeed(options: {
  limit: number;
  cursor?: string;
}) {
  return getFeed(options);
}

export function getMyOpinions(options: {
  authorId: string;
  limit: number;
  cursor?: string;
}) {
  return getFeed(options);
}