import { NextRequest } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { hash } from "crypto";

import { db } from "@/server/data.server";
import { userSessions } from "@/lib/schema";
import { logoutSchema } from "@/schemas/logout.schema";
import { routeError } from "@/server/middleware/error.server";

export const POST = async (request: NextRequest) => {
  try {
    const body = logoutSchema.safeParse(await request.json());
    if (!body.success) {
      return routeError(body.error.message, 400);
    }

    const data = body.data;
    const oldRefreshTokenHash = hash("sha512", data.token, "hex");

    await db
      .update(userSessions)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(userSessions.tokenHash, oldRefreshTokenHash),
          gt(userSessions.expiresAt, new Date()),
        ),
      );

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(`SERVER api/auth/logout : ${error}`);
    return routeError(
      "An unexpected error occurred, please try again later.",
      500,
    );
  }
};
