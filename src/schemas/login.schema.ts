import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .refine((password) => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password,
      );
    }, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
