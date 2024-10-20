import { NextRequest } from "next/server";
import { eq, and, isNull, gt } from "drizzle-orm";
import { hash, randomBytes } from "crypto";

import { db } from "@/server/data.server";
import { users, userSessions } from "@/lib/schema";
import { createToken } from "@/server/util/auth.server";
import { refreshSchema } from "@/schemas/auth/refresh.schema";
import { routeError } from "@/server/middleware/error.server";
import { Tokens } from "@/lib/services/types/auth";

export const POST = async (request: NextRequest) => {
  try {
    const body = refreshSchema.safeParse(await request.json());
    if (!body.success) {
      return routeError(body.error.message, 400);
    }

    const data = body.data;
    const oldRefreshTokenHash = hash("sha512", data.token, "hex");

    const result = await db
      .select()
      .from(users)
      .innerJoin(userSessions, eq(users.id, userSessions.userId))
      .where(
        and(
          eq(userSessions.tokenHash, oldRefreshTokenHash),
          gt(userSessions.expiresAt, new Date()),
          isNull(userSessions.deletedAt),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return routeError(
        "A valid refresh token was not provided. Please login again.",
        401,
      );
    }

    const user = result[0];
    const token = await createToken(user.users);
    const refreshToken = randomBytes(32).toString("base64url");
    const refreshTokenHash = hash("sha512", refreshToken, "hex");
    const tokenObject: Tokens = {
      accessToken: token,
      refreshToken,
      expiresIn: Date.now() / 1000 + 60 * 10,
    };

    await db
      .update(userSessions)
      .set({
        tokenHash: refreshTokenHash,
      })
      .where(eq(userSessions.id, user.user_sessions.id));

    return new Response(JSON.stringify(tokenObject), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(`SERVER api/auth/refresh : ${error}`);
    return routeError(
      "An unexpected error occurred, please try again later.",
      500,
    );
  }
};
