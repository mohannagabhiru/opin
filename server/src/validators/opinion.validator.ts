import { z } from "zod";

const selectedLocationSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1)
      .max(500),

    latitude: z.number().min(-90).max(90),

    longitude: z.number().min(-180).max(180),

    countryCode: z
      .string()
      .length(2)
      .optional(),

    region: z.string().max(150).optional(),

    city: z.string().max(150).optional(),

    osmType: z
      .enum(["node", "way", "relation"])
      .optional(),

    osmId: z.string().max(50).optional(),
  })
  .strict();

export const createOpinionSchema = z
  .object({
    content: z
      .object({
        text: z
          .string()
          .trim()
          .min(1, "Opinion cannot be empty")
          .max(5000, "Opinion is too long"),
      })
      .strict(),

    location: selectedLocationSchema,
  })
  .strict();

export const opinionFeedSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(500).optional(),
});

export type CreateOpinionInput = z.infer<
  typeof createOpinionSchema
>;

export type OpinionFeedInput = z.infer<
  typeof opinionFeedSchema
>;