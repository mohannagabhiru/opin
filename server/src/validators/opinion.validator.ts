
import { z } from "zod";

export const createOpinionSchema = z.object({
  content: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Opinion text cannot be empty")
      .max(5000, "Opinion cannot exceed 5000 characters"),
  }).strict(),

  location: z.object({
    selectionToken: z
      .string()
      .min(1)
      .max(4096),
  }).strict(),
}).strict();

export const opinionFeedSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(500).optional(),
});

export type CreateOpinionInput = z.infer<
  typeof createOpinionSchema
>;
