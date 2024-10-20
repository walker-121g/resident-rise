import { z } from "zod";

export const refreshSchema = z.object({
  token: z.string(),
});

export type RefreshSchema = z.infer<typeof refreshSchema>;
