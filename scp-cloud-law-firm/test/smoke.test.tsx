import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { useAppStore } from "@/store/useAppStore";
import { DOSSIERS, USERS, CLIENTS } from "@/data/mockData";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

const push = vi.fn();
const replace = vi.fn();
let mockParams: Record<string, string> = {};
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, prefetch: vi.fn() }),
  usePathname: () => "/dossiers",
  useParams: () => mockParams,
  useSearchParams: () => mockSearchParams,
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const associate = USERS.find((u) => u.id === "assoc-1")!;
const intern = USERS.find((u) => u.id === "intern-1")!;
const restrictedDossier = DOSSIERS.find((d) => d.isRestricted)!; // dos-jts103-001, not assigned to intern-1
const client = CLIENTS.find((c) => c.id === "client-cbc101")!;

function loginAs(user: typeof associate) {
  useAppStore.setState({ session: { kind: "STAFF", user } });
}

function loginAsClient() {
  useAppStore.setState({ session: { kind: "CLIENT", client } });
}

beforeEach(() => {
  mockParams = {};
  mockSearchParams = new URLSearchParams();
  useAppStore.setState({ session: null });
});

// Dynamic imports so the next/navigation mock above is applied first for every module.

describe("Dossiers list page", () => {
  it("renders for ASSOCIATE without throwing", async () => {
    loginAs(associate);
    const { default: DossiersPage } = await import("@/app/(app)/dossiers/page");
    expect(() => render(<DossiersPage />)).not.toThrow();
  });

  it("renders for INTERN without throwing", async () => {
    loginAs(intern);
    const { default: DossiersPage } = await import("@/app/(app)/dossiers/page");
    expect(() => render(<DossiersPage />)).not.toThrow();
  });
});

describe("Dashboard page (associate analytics)", () => {
  it("renders for ASSOCIATE without throwing", async () => {
    loginAs(associate);
    const { default: DashboardPage } = await import("@/app/(app)/dashboard/page");
    expect(() => render(<DashboardPage />)).not.toThrow();
  });
});

describe("Clients pages", () => {
  it("list page renders for ASSOCIATE", async () => {
    loginAs(associate);
    const { default: ClientsPage } = await import("@/app/(app)/clients/page");
    expect(() => render(<ClientsPage />)).not.toThrow();
  });

  it("detail page renders for a real client id", async () => {
    loginAs(associate);
    mockParams = { id: client.id };
    const { default: ClientDetailPage } = await import("@/app/(app)/clients/[id]/page");
    expect(() => render(<ClientDetailPage />)).not.toThrow();
  });
});

describe("Dossier detail page — chemise virtuelle", () => {
  it("renders for ASSOCIATE (full access) on every seeded dossier", async () => {
    loginAs(associate);
    const { default: DossierDetailPage } = await import("@/app/(app)/dossiers/[id]/page");
    for (const d of DOSSIERS) {
      mockParams = { id: d.id };
      expect(() => render(<DossierDetailPage />), `dossier ${d.dossierRef}`).not.toThrow();
    }
  });

  it("shows the restricted-access screen (not a crash) for an INTERN without a token", async () => {
    loginAs(intern);
    mockParams = { id: restrictedDossier.id };
    const { default: DossierDetailPage } = await import("@/app/(app)/dossiers/[id]/page");
    expect(() => render(<DossierDetailPage />)).not.toThrow();
  });

  it("renders every tab's content directly (Discussion/GED/Agenda/Audit) for a real dossier", async () => {
    loginAs(associate);
    const dossier = DOSSIERS[0];
    const { ChatThread } = await import("@/components/dossier-detail/ChatThread");
    const { GedTree } = await import("@/components/dossier-detail/GedTree");
    const { DossierAgendaTab } = await import("@/components/dossier-detail/DossierAgendaTab");
    const { AuditLogList } = await import("@/components/dossier-detail/AuditLogList");
    const { ChecklistPaperasse } = await import("@/components/dossier-detail/ChecklistPaperasse");

    expect(() => render(<ChatThread dossierId={dossier.id} />), "ChatThread").not.toThrow();
    expect(() => render(<GedTree dossierId={dossier.id} />), "GedTree").not.toThrow();
    expect(() => render(<DossierAgendaTab dossierId={dossier.id} />), "DossierAgendaTab").not.toThrow();
    expect(() => render(<AuditLogList dossierId={dossier.id} />), "AuditLogList").not.toThrow();
    expect(() => render(<ChecklistPaperasse dossier={dossier} />), "ChecklistPaperasse").not.toThrow();
  });

  it("renders every tab's content even for a dossier with zero messages/files/events/logs (empty-state check)", async () => {
    loginAs(associate);
    // Create a brand-new dossier via the store so it has empty arrays everywhere.
    const fresh = useAppStore.getState().addDossier({
      titre: "Dossier de test vide",
      clientId: client.id,
      associeReferentId: associate.id,
      stagiairesAssignesIds: [],
      isRestricted: false,
      checklistLabels: [],
    });
    const { ChatThread } = await import("@/components/dossier-detail/ChatThread");
    const { GedTree } = await import("@/components/dossier-detail/GedTree");
    const { DossierAgendaTab } = await import("@/components/dossier-detail/DossierAgendaTab");
    const { AuditLogList } = await import("@/components/dossier-detail/AuditLogList");
    const { ChecklistPaperasse } = await import("@/components/dossier-detail/ChecklistPaperasse");

    expect(() => render(<ChatThread dossierId={fresh.id} />), "ChatThread (empty)").not.toThrow();
    expect(() => render(<GedTree dossierId={fresh.id} />), "GedTree (empty)").not.toThrow();
    expect(() => render(<DossierAgendaTab dossierId={fresh.id} />), "DossierAgendaTab (empty)").not.toThrow();
    expect(() => render(<AuditLogList dossierId={fresh.id} />), "AuditLogList (empty)").not.toThrow();
    expect(() => render(<ChecklistPaperasse dossier={fresh} />), "ChecklistPaperasse (empty)").not.toThrow();
  });
});

describe("Other staff pages", () => {
  it("templates page renders for ASSOCIATE", async () => {
    loginAs(associate);
    const { default: TemplatesPage } = await import("@/app/(app)/templates/page");
    expect(() => render(<TemplatesPage />)).not.toThrow();
  });

  it("agenda page renders for ASSOCIATE and INTERN", async () => {
    const { default: AgendaPage } = await import("@/app/(app)/agenda/page");
    loginAs(associate);
    expect(() => render(<AgendaPage />), "associate").not.toThrow();
    loginAs(intern);
    expect(() => render(<AgendaPage />), "intern").not.toThrow();
  });

  it("archives page renders for ASSOCIATE", async () => {
    loginAs(associate);
    const { default: ArchivesPage } = await import("@/app/(app)/archives/page");
    expect(() => render(<ArchivesPage />)).not.toThrow();
  });
});

describe("Client extranet", () => {
  it("renders for a logged-in client", async () => {
    loginAsClient();
    const { default: ExtranetPage } = await import("@/app/(client)/extranet/page");
    expect(() => render(<ExtranetPage />)).not.toThrow();
  });
});
