
import { z } from "zod";

export const locationSearchSchema = z.object({
  q: z
    .string()
    .trim()
    .min(3, "Enter at least 3 characters")
    .max(150, "Location query is too long"),
});

export type LocationSearchInput = z.infer<
  typeof locationSearchSchema
>;
