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
    isAdmin: employee?.role === "manager" || employee?.role === "owner",
    isOwner: employee?.role === "owner",
    isStaff: employee?.role === "staff",
    refresh,
  };
}

