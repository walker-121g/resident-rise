import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { Tokens } from "@/lib/services/types/auth";

export type AuthState = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

export type AuthActions = {
  authenticate: (tokens: Tokens) => Promise<void>;
  unauthenticate: () => Promise<void>;
};

export const useAuth = create(
  persist<AuthState & AuthActions>(
    (set) => ({
      accessToken: undefined,
      refeshToken: undefined,
      expiresAt: undefined,
      authenticate: async (tokens: Tokens) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: Date.now() + tokens.expiresIn * 1000,
        });
      },
      unauthenticate: async () => {
        set({
          accessToken: undefined,
          refreshToken: undefined,
          expiresAt: undefined,
        });
      },
    }),
    {
      name: "auth-state",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
