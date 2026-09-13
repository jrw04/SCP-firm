// ============================================================================
// SCP CLOUD LAW FIRM — Data model
// Backend is mockable (per brief): these types describe the shape of data
// held in the client-side store (store/useAppStore.ts) and would map 1:1
// onto Supabase/Prisma tables in a real backend.
// ============================================================================

export type UserRole = "ASSOCIATE" | "INTERN" | "CLIENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  initials: string;
  color: string; // accent used for avatar + chat mentions
}

export interface Client {
  id: string;
  codeClient: string; // Ex: "CBC-101", "MOR-102"
  nomRaisonSociale: string;
  typeClient: "PARTICULIER" | "ENTREPRISE";
  email: string;
  telephone: string;
  adresse: string;
  piecesIdentitePaths: string[];
  createdAt: string;
}

export type DossierStatus =
  | "CONSTITUTION"
  | "DEPOT_PARQUET"
  | "VISA_SIGNATURE"
  | "AUDIENCE"
  | "DELIBERE"
  | "ARCHIVE";

export const DOSSIER_STATUS_ORDER: DossierStatus[] = [
  "CONSTITUTION",
  "DEPOT_PARQUET",
  "VISA_SIGNATURE",
  "AUDIENCE",
  "DELIBERE",
  "ARCHIVE",
];

export const DOSSIER_STATUS_LABELS: Record<DossierStatus, string> = {
  CONSTITUTION: "1. Constitution",
  DEPOT_PARQUET: "2. Transmission Parquet/Greffe",
  VISA_SIGNATURE: "3. En attente Signature/Visa",
  AUDIENCE: "4. Fixation Audience",
  DELIBERE: "5. Délibéré / Décision",
  ARCHIVE: "6. Clôture",
};

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Dossier {
  id: string;
  dossierRef: string; // Ex: "DOS-CBC101-2026-001"
  titre: string;
  clientId: string;
  associeReferentId: string; // un des 4 associés
  stagiairesAssignesIds: string[];
  isRestricted: boolean;
  paperasseComplete: boolean;
  checklistPaperasse: ChecklistItem[];
  status: DossierStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DossierAccessToken {
  id: string;
  dossierId: string;
  stagiaireId: string;
  tokenCode: string;
  expiresAt: string; // ISO string
  isActive: boolean;
  createdAt: string;
  createdByUserId: string;
}

export interface DossierMessage {
  id: string;
  dossierId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  attachments?: string[];
  createdAt: string;
  isPublicToClient?: boolean; // surfaced (as a note) on the client extranet timeline
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  contentTemplate: string; // contains {{CLIENT_NOM}}, {{DOSSIER_REF}}, etc.
}

export type GedFolder =
  | "01_Pieces_Client"
  | "02_Actes_Et_Procedure"
  | "03_Correspondances"
  | "04_Decisions_Et_Jugements";

export const GED_FOLDERS: GedFolder[] = [
  "01_Pieces_Client",
  "02_Actes_Et_Procedure",
  "03_Correspondances",
  "04_Decisions_Et_Jugements",
];

export interface GedFileVersion {
  version: number;
  uploadedByUserId: string;
  uploadedByName: string;
  uploadedAt: string;
  fileName: string; // e.g. "bordereau-pieces_v2.pdf"
  sizeBytes?: number;
  /** Present only for files actually dropped in-browser during this session (demo has no real file storage). */
  objectUrl?: string;
}

export interface GedFile {
  id: string;
  dossierId: string;
  folder: GedFolder;
  baseName: string; // e.g. "bordereau-pieces" (without version/extension)
  extension: string; // "pdf" | "docx" | ...
  sharedWithClient: boolean;
  versions: GedFileVersion[]; // last item = current version
}

export type AgendaEventType =
  | "REUNION_CLIENT"
  | "PARQUET_GREFFE"
  | "COMMISSARIAT"
  | "AUDIENCE";

export const AGENDA_EVENT_LABELS: Record<AgendaEventType, string> = {
  REUNION_CLIENT: "Réunion client",
  PARQUET_GREFFE: "Parquet / Greffe",
  COMMISSARIAT: "Commissariat",
  AUDIENCE: "Audience",
};

export interface AgendaEvent {
  id: string;
  dossierId: string;
  title: string;
  type: AgendaEventType;
  eventDate: string; // ISO
  location: string;
  notifiedUserIds: string[];
}

export interface AuditLog {
  id: string;
  dossierId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export type NotificationLeadTime = "J-7" | "J-2" | "24H" | "2H";

export interface AppNotification {
  id: string;
  userId: string; // recipient
  title: string;
  body: string;
  dossierId?: string;
  eventId?: string;
  leadTime?: NotificationLeadTime;
  createdAt: string;
  read: boolean;
  emailSimulated: boolean;
}
