import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthState = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

export type AuthActions = {
  authenticate: () => void;
  unauthenticate: () => void;
  refresh: () => void;
};

export const useAuth = create(
  persist<AuthState & AuthActions>(
    (set) => ({
      accessToken: undefined,
      refeshToken: undefined,
      expiresAt: undefined,
      authenticate: () => {},
      unauthenticate: () => {},
      refresh: () => {},
    }),
    {
      name: "auth-state",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
