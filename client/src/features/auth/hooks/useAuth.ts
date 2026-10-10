import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function useAuth() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
  });
}