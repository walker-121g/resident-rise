import { z } from "zod";

export const logoutSchema = z.object({
  token: z.string(),
});

export type LogoutSchema = z.infer<typeof logoutSchema>;
