import { useAuth } from "@/components/AuthProvider";

/**
 * useSession Hook
 * 包裝 useAuth，提供更簡潔的 API
 */
export function useSession() {
  const { user, employee, loading, refresh } = useAuth();

  return {
    user,
    employee,
    loading,
    isAdmin: employee?.role === "owner",
    isOwner: employee?.role === "owner",
    isDuty: employee?.role === "duty",
    isStaff: employee?.role === "staff",
    refresh,
  };
}

