import { apiGet, apiPost } from "@/lib/api-client";
import type { AuthResponse, LoginPayload, User } from "@/types/auth";

export const authService = {
  /**
   * Authenticates a user with email and password.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiPost<AuthResponse, LoginPayload>("/auth/login", payload);
  },

  /**
   * Retrieves the currently authenticated user's profile.
   */
  async fetchMe(): Promise<User> {
    return apiGet<User>("/users/me");
  },

  /**
   * Revokes the current session and clears the backend refresh token cookie.
   */
  async logoutRequest(): Promise<null> {
    return apiPost<null>("/auth/logout");
  },
};
