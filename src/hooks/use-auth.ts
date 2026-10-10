import { useAuthStore } from "@/stores/auth-store";
import type { Role, User } from "@/types/auth";

export interface UseAuthReturn {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isUnreachable: boolean;
  hasRole: (...roles: Role[]) => boolean;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = status === "authenticated" && user !== null;
  const isLoading = status === "loading" || status === "idle";
  const isUnreachable = status === "unreachable";
  const role = user?.role ?? null;

  const hasRole = (...roles: Role[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    isUnreachable,
    hasRole,
    logout,
  };
}
