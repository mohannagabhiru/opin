
import { z } from "zod";

export const locationSearchSchema = z.object({
  q: z
    .string()
    .trim()
    .min(3, "Enter at least 3 characters")
    .max(150, "Location query is too long"),
});

export const locationSelectionSchema = z.object({
  selectionToken: z.string().min(1).max(4096),
});

export type LocationSearchInput = z.infer<
  typeof locationSearchSchema
>;
