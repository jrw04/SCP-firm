"use client";

import { useAppStore } from "@/store/useAppStore";
import type { User, Client } from "@/types/database";

export function useAuth() {
  const session = useAppStore((s) => s.session);
  const logout = useAppStore((s) => s.logout);

  const isStaff = session?.kind === "STAFF";
  const isClient = session?.kind === "CLIENT";
  const staffUser: User | null = session?.kind === "STAFF" ? session.user : null;
  const clientAccount: Client | null = session?.kind === "CLIENT" ? session.client : null;

  return {
    session,
    isAuthenticated: !!session,
    isStaff,
    isClient,
    isAssociate: staffUser?.role === "ASSOCIATE",
    isIntern: staffUser?.role === "INTERN",
    staffUser,
    clientAccount,
    logout,
  };
}
