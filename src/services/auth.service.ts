import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

export const authService = {
  /**
   * Authenticates a user with email and password.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiPost<AuthResponse, LoginPayload>("/auth/login", payload);
  },

  /**
   * Registers a new customer account.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiPost<AuthResponse, RegisterPayload>("/auth/register", payload);
  },

  /**
   * Updates password for the currently authenticated user.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<null> {
    return apiPatch<null, ChangePasswordPayload>(
      "/auth/change-password",
      payload,
    );
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
