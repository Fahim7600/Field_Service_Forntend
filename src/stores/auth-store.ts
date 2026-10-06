import { create } from "zustand";
import type { AuthStatus, User } from "@/types/auth";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "idle",
  setSession: (user, accessToken) =>
    set({
      user,
      accessToken,
      status: "authenticated",
    }),
  setAccessToken: (accessToken) =>
    set((state) => ({
      accessToken,
      status: accessToken ? "authenticated" : state.status,
    })),
  setUser: (user) =>
    set((state) => ({
      user,
      status: user ? "authenticated" : state.status,
    })),
  setStatus: (status) => set({ status }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      status: "unauthenticated",
    }),
}));
