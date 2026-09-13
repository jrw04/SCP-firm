"use client";

import { useAppStore, visibleDossiersFor, canStaffViewDossier, APP_NOW } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";

export function useDossierAccess() {
  const { staffUser } = useAuth();
  const dossiers = useAppStore((s) => s.dossiers);
  const tokens = useAppStore((s) => s.accessTokens);

  const visibleDossiers = staffUser ? visibleDossiersFor(staffUser, dossiers, tokens, APP_NOW) : [];

  const canView = (dossierId: string) => {
    if (!staffUser) return false;
    const dossier = dossiers.find((d) => d.id === dossierId);
    if (!dossier) return false;
    return canStaffViewDossier(staffUser, dossier, tokens, APP_NOW);
  };

  return { visibleDossiers, canView };
}
