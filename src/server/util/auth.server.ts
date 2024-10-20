import { verify, sign } from "jsonwebtoken";
import { pbkdf2Sync, randomBytes } from "crypto";
import { users } from "@/lib/schema";

export const hashPassword = async (
  password: string,
  salt?: string,
): Promise<string> => {
  if (!salt) {
    salt = randomBytes(16).toString("hex");
  }

  const hash = pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  return `${salt}:${hash}`;
};

export const checkPassword = async (
  input: string,
  stored: string,
): Promise<boolean> => {
  const [salt, password] = stored.split(":");
  const hash = pbkdf2Sync(input, salt, 1000, 64, `sha512`).toString(`hex`);
  return password === hash;
};

export const createToken = async (
  user: typeof users.$inferSelect,
): Promise<string> => {
  return sign(user, process.env.AUTH_SECRET!, {
    expiresIn: "10m",
    issuer: "https://residentrise.com",
    audience: "https://residentrise.com",
    algorithm: "HS512",
  });
};

export const verifyToken = async (
  token: string,
): Promise<typeof users.$inferSelect> => {
  return verify(token, process.env.AUTH_SECRET!, {
    issuer: "https://residentrise.com",
    audience: "https://residentrise.com",
    algorithms: ["HS512"],
  }) as typeof users.$inferSelect;
};
