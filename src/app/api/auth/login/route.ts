import { NextRequest } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { hash, randomBytes } from "crypto";

import { db } from "@/server/data.server";
import { users, userCredentials, userSessions } from "@/lib/schema";
import { checkPassword, createToken } from "@/server/util/auth.server";
import { loginSchema } from "@/schemas/login.schema";
import { routeError } from "@/server/middleware/error.server";
import { Tokens } from "@/lib/services/types/auth";

export const POST = async (request: NextRequest) => {
  try {
    const body = loginSchema.safeParse(await request.json());
    if (!body.success) {
      return routeError(body.error.message, 400);
    }

    const data = body.data;
    const result = await db
      .select()
      .from(users)
      .innerJoin(userCredentials, eq(users.id, userCredentials.userId))
      .where(and(eq(users.email, data.email), isNull(users.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      return routeError(
        "The email and password combination entered is incorrect.",
        401,
      );
    }

    const user = result[0];
    if (
      user.user_credentials.type !== "PASSWORD" ||
      !user.user_credentials.type
    ) {
      return routeError(
        "The email and password combination entered is incorrect.",
        401,
      );
    }

    if (
      !(await checkPassword(data.password, user.user_credentials.passwordHash!))
    ) {
      return routeError(
        "The email and password combination entered is incorrect.",
        401,
      );
    }

    const token = await createToken(user.users);
    const refreshToken = randomBytes(32).toString("base64url");
    const refreshTokenHash = hash("sha512", refreshToken, "hex");
    const tokenObject: Tokens = {
      accessToken: token,
      refreshToken,
      expiresIn: Date.now() / 1000 + 60 * 10,
    };

    await db.insert(userSessions).values({
      userId: user.users.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    return new Response(JSON.stringify(tokenObject), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(`SERVER api/auth/login : ${error}`);
    return routeError(
      "An unexpected error occurred, please try again later.",
      500,
    );
  }
};
