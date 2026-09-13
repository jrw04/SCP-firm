"use client";

import { create } from "zustand";
import type {
  User,
  Client,
  Dossier,
  DossierStatus,
  DossierAccessToken,
  DossierMessage,
  DocumentTemplate,
  GedFile,
  GedFolder,
  AgendaEvent,
  AuditLog,
  AppNotification,
} from "@/types/database";
import {
  USERS,
  CLIENTS,
  DOSSIERS,
  ACCESS_TOKENS,
  MESSAGES,
  TEMPLATES,
  GED_FILES,
  AGENDA_EVENTS,
  AUDIT_LOGS,
  NOTIFICATIONS,
} from "@/data/mockData";
import { generateClientCode, nextDossierRef, generateAccessCode, expiryFromDuration, type AccessCodeDuration } from "@/services/codeGenerator";
import { scheduleNotificationsForEvent } from "@/services/notificationEngine";

// The dataset is anchored to this date so relative "il y a / dans X jours"
// language and access-code expiry checks stay coherent for the demo.
export const APP_NOW = new Date("2026-08-09T09:00:00.000Z");

let seq = 1000;
const uid = (prefix: string) => `${prefix}-${seq++}`;

export type Session =
  | { kind: "STAFF"; user: User }
  | { kind: "CLIENT"; client: Client }
  | null;

interface AppState {
  // ---- "tables" -----------------------------------------------------------
  users: User[];
  clients: Client[];
  dossiers: Dossier[];
  accessTokens: DossierAccessToken[];
  messages: DossierMessage[];
  templates: DocumentTemplate[];
  gedFiles: GedFile[];
  agendaEvents: AgendaEvent[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];

  // ---- session --------------------------------------------------------------
  session: Session;
  loginStaff: (userId: string) => void;
  loginClient: (codeClient: string, email: string) => { ok: boolean; message?: string };
  logout: () => void;

  // ---- clients (Module 2) ----------------------------------------------------
  addClient: (input: Omit<Client, "id" | "codeClient" | "createdAt">) => Client;

  // ---- dossiers / kanban (Modules 3 & 5) --------------------------------------
  addDossier: (input: {
    titre: string;
    clientId: string;
    associeReferentId: string;
    stagiairesAssignesIds: string[];
    isRestricted: boolean;
    checklistLabels: string[];
  }) => Dossier;
  toggleChecklistItem: (dossierId: string, itemId: string) => void;
  moveDossierStatus: (dossierId: string, next: DossierStatus, note: string, actingUserId: string) => void;

  // ---- RBAC unlock module ------------------------------------------------------
  generateAccessToken: (dossierId: string, stagiaireId: string, duration: AccessCodeDuration, customDate: Date | undefined, actingUserId: string) => DossierAccessToken;
  redeemAccessCode: (code: string, stagiaireId: string) => { ok: boolean; message: string; dossierId?: string };
  revokeAccessToken: (tokenId: string, actingUserId: string) => void;

  // ---- messaging (Module 3) ---------------------------------------------------
  sendMessage: (dossierId: string, content: string, author: User, isPublicToClient?: boolean, attachments?: string[]) => void;

  // ---- GED (Module 6) -----------------------------------------------------------
  addGedFile: (dossierId: string, folder: GedFolder, baseName: string, extension: string, uploadedBy: User, sizeBytes?: number, objectUrl?: string) => void;
  addGedFileVersion: (fileId: string, uploadedBy: User, sizeBytes?: number, objectUrl?: string) => void;
  toggleGedFileShared: (fileId: string) => void;

  // ---- agenda & notifications (Module 7) -----------------------------------------
  addAgendaEvent: (input: Omit<AgendaEvent, "id">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  // ---- audit ---------------------------------------------------------------------
  logAction: (dossierId: string, userId: string, userName: string, action: string, details: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  users: USERS,
  clients: CLIENTS,
  dossiers: DOSSIERS,
  accessTokens: ACCESS_TOKENS,
  messages: MESSAGES,
  templates: TEMPLATES,
  gedFiles: GED_FILES,
  agendaEvents: AGENDA_EVENTS,
  auditLogs: AUDIT_LOGS,
  notifications: NOTIFICATIONS,

  session: null,

  loginStaff: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) set({ session: { kind: "STAFF", user } });
  },

  loginClient: (codeClient, email) => {
    const client = get().clients.find(
      (c) => c.codeClient.toLowerCase() === codeClient.trim().toLowerCase()
    );
    if (!client) return { ok: false, message: "Code client introuvable." };
    if (client.email.toLowerCase() !== email.trim().toLowerCase()) {
      return { ok: false, message: "L'email ne correspond pas à ce code client." };
    }
    set({ session: { kind: "CLIENT", client } });
    return { ok: true };
  },

  logout: () => set({ session: null }),

  addClient: (input) => {
    const codeClient = generateClientCode(input.nomRaisonSociale, get().clients);
    const client: Client = {
      id: uid("client"),
      codeClient,
      createdAt: APP_NOW.toISOString(),
      ...input,
    };
    set((s) => ({ clients: [client, ...s.clients] }));
    return client;
  },

  addDossier: ({ titre, clientId, associeReferentId, stagiairesAssignesIds, isRestricted, checklistLabels }) => {
    const client = get().clients.find((c) => c.id === clientId);
    const year = APP_NOW.getUTCFullYear();
    const dossierRef = nextDossierRef(client?.codeClient ?? "GEN-000", year, get().dossiers.map((d) => d.dossierRef));
    const dossier: Dossier = {
      id: uid("dos"),
      dossierRef,
      titre,
      clientId,
      associeReferentId,
      stagiairesAssignesIds,
      isRestricted,
      paperasseComplete: checklistLabels.length === 0,
      checklistPaperasse: checklistLabels.map((label, i) => ({ id: `chk-${i}`, label, checked: false })),
      status: "CONSTITUTION",
      createdAt: APP_NOW.toISOString(),
      updatedAt: APP_NOW.toISOString(),
    };
    set((s) => ({ dossiers: [dossier, ...s.dossiers] }));
    return dossier;
  },

  toggleChecklistItem: (dossierId, itemId) => {
    set((s) => ({
      dossiers: s.dossiers.map((d) => {
        if (d.id !== dossierId) return d;
        const checklistPaperasse = d.checklistPaperasse.map((it) =>
          it.id === itemId ? { ...it, checked: !it.checked } : it
        );
        const paperasseComplete = checklistPaperasse.length > 0 && checklistPaperasse.every((it) => it.checked);
        return { ...d, checklistPaperasse, paperasseComplete, updatedAt: APP_NOW.toISOString() };
      }),
    }));
  },

  moveDossierStatus: (dossierId, next, note, actingUserId) => {
    const user = get().users.find((u) => u.id === actingUserId);
    set((s) => ({
      dossiers: s.dossiers.map((d) =>
        d.id === dossierId ? { ...d, status: next, updatedAt: APP_NOW.toISOString() } : d
      ),
    }));
    get().logAction(dossierId, actingUserId, user?.name ?? "Utilisateur", "CHANGEMENT_STATUT", note);
  },

  generateAccessToken: (dossierId, stagiaireId, duration, customDate, actingUserId) => {
    const expiresAt = expiryFromDuration(duration, APP_NOW, customDate);
    const token: DossierAccessToken = {
      id: uid("tok"),
      dossierId,
      stagiaireId,
      tokenCode: generateAccessCode(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      createdAt: APP_NOW.toISOString(),
      createdByUserId: actingUserId,
    };
    set((s) => ({ accessTokens: [token, ...s.accessTokens] }));
    const user = get().users.find((u) => u.id === actingUserId);
    const stagiaire = get().users.find((u) => u.id === stagiaireId);
    get().logAction(
      dossierId,
      actingUserId,
      user?.name ?? "Utilisateur",
      "GENERATION_CODE_ACCES",
      `Génération d'un code d'accès temporaire pour ${stagiaire?.name ?? stagiaireId} (${durationLabel(duration)}).`
    );
    return token;
  },

  redeemAccessCode: (code, stagiaireId) => {
    const token = get().accessTokens.find(
      (t) => t.tokenCode.toLowerCase() === code.trim().toLowerCase() && t.stagiaireId === stagiaireId
    );
    if (!token) return { ok: false, message: "Code invalide ou ne correspondant pas à votre compte." };
    if (!token.isActive) return { ok: false, message: "Ce code a été révoqué." };
    if (new Date(token.expiresAt).getTime() < APP_NOW.getTime()) {
      return { ok: false, message: "Ce code a expiré." };
    }
    const stagiaire = get().users.find((u) => u.id === stagiaireId);
    get().logAction(
      token.dossierId,
      stagiaireId,
      stagiaire?.name ?? "Stagiaire",
      "DEVERROUILLAGE_CODE",
      `Accès débloqué via code temporaire (token ${token.tokenCode}).`
    );
    return { ok: true, message: "Accès débloqué.", dossierId: token.dossierId };
  },

  revokeAccessToken: (tokenId, actingUserId) => {
    const token = get().accessTokens.find((t) => t.id === tokenId);
    set((s) => ({
      accessTokens: s.accessTokens.map((t) => (t.id === tokenId ? { ...t, isActive: false } : t)),
    }));
    if (token) {
      const user = get().users.find((u) => u.id === actingUserId);
      get().logAction(token.dossierId, actingUserId, user?.name ?? "Utilisateur", "REVOCATION_CODE_ACCES", `Code d'accès ${token.tokenCode} révoqué.`);
    }
  },

  sendMessage: (dossierId, content, author, isPublicToClient, attachments) => {
    const message: DossierMessage = {
      id: uid("msg"),
      dossierId,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      createdAt: APP_NOW.toISOString(),
      isPublicToClient: !!isPublicToClient,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    };
    set((s) => ({ messages: [...s.messages, message] }));
  },

  addGedFile: (dossierId, folder, baseName, extension, uploadedBy, sizeBytes, objectUrl) => {
    const file: GedFile = {
      id: uid("ged"),
      dossierId,
      folder,
      baseName,
      extension,
      sharedWithClient: false,
      versions: [
        {
          version: 1,
          uploadedByUserId: uploadedBy.id,
          uploadedByName: uploadedBy.name,
          uploadedAt: APP_NOW.toISOString(),
          fileName: `${baseName}_v1.${extension}`,
          sizeBytes,
          objectUrl,
        },
      ],
    };
    set((s) => ({ gedFiles: [file, ...s.gedFiles] }));
    get().logAction(dossierId, uploadedBy.id, uploadedBy.name, "DEPOT_DOCUMENT", `Dépôt de « ${file.versions[0].fileName} » dans ${folder}.`);
  },

  addGedFileVersion: (fileId, uploadedBy, sizeBytes, objectUrl) => {
    set((s) => ({
      gedFiles: s.gedFiles.map((f) => {
        if (f.id !== fileId) return f;
        const nextVersion = f.versions.length + 1;
        return {
          ...f,
          versions: [
            ...f.versions,
            {
              version: nextVersion,
              uploadedByUserId: uploadedBy.id,
              uploadedByName: uploadedBy.name,
              uploadedAt: APP_NOW.toISOString(),
              fileName: `${f.baseName}_v${nextVersion}.${f.extension}`,
              sizeBytes,
              objectUrl,
            },
          ],
        };
      }),
    }));
    const file = get().gedFiles.find((f) => f.id === fileId);
    if (file) {
      get().logAction(file.dossierId, uploadedBy.id, uploadedBy.name, "NOUVELLE_VERSION", `Nouvelle version de « ${file.baseName}.${file.extension} » déposée.`);
    }
  },

  toggleGedFileShared: (fileId) => {
    set((s) => ({
      gedFiles: s.gedFiles.map((f) => (f.id === fileId ? { ...f, sharedWithClient: !f.sharedWithClient } : f)),
    }));
  },

  addAgendaEvent: (input) => {
    const event: AgendaEvent = { id: uid("evt"), ...input };
    const scheduled = scheduleNotificationsForEvent(event, APP_NOW).map((n) => ({ ...n, id: uid("notif") }));
    set((s) => ({
      agendaEvents: [...s.agendaEvents, event],
      notifications: [...scheduled, ...s.notifications],
    }));
  },

  markNotificationRead: (id) => {
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  },

  markAllNotificationsRead: (userId) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    }));
  },

  logAction: (dossierId, userId, userName, action, details) => {
    const log: AuditLog = {
      id: uid("log"),
      dossierId,
      userId,
      userName,
      action,
      details,
      timestamp: APP_NOW.toISOString(),
    };
    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
  },
}));

function durationLabel(d: AccessCodeDuration) {
  switch (d) {
    case "12H": return "12 heures";
    case "24H": return "24 heures";
    case "48H": return "48 heures";
    case "7D": return "7 jours";
    case "CUSTOM": return "durée personnalisée";
  }
}

// ---------------------------------------------------------------------------
// Access-control helpers (pure functions over store data — used by pages
// and route guards, not stored in state)
// ---------------------------------------------------------------------------
export function hasValidToken(tokens: DossierAccessToken[], dossierId: string, stagiaireId: string, now: Date) {
  return tokens.some(
    (t) =>
      t.dossierId === dossierId &&
      t.stagiaireId === stagiaireId &&
      t.isActive &&
      new Date(t.expiresAt).getTime() >= now.getTime()
  );
}

export function canStaffViewDossier(user: User, dossier: Dossier, tokens: DossierAccessToken[], now: Date) {
  if (user.role === "ASSOCIATE") return true;
  if (user.role === "INTERN") {
    return dossier.stagiairesAssignesIds.includes(user.id) || hasValidToken(tokens, dossier.id, user.id, now);
  }
  return false;
}

export function visibleDossiersFor(user: User, dossiers: Dossier[], tokens: DossierAccessToken[], now: Date) {
  return dossiers.filter((d) => canStaffViewDossier(user, d, tokens, now));
}
