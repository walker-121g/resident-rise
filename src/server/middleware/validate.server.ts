import { headers } from "next/headers";

import { users } from "@/lib/schema";
import { verifyToken } from "@/server/util/auth.server";

export const authenticate = async (): Promise<
  typeof users.$inferSelect | false
> => {
  const authorization = headers().get("Authorization");
  if (!authorization) {
    return false;
  }

  const user = await verifyToken(authorization.replace("Bearer ", ""));
  if (!user) {
    return false;
  }

  return user;
};
