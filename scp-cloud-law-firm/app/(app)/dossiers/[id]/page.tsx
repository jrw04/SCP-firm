"use client";

import { useParams, notFound } from "next/navigation";
import { Lock, CalendarPlus } from "lucide-react";
import { useAppStore, APP_NOW, canStaffViewDossier } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { DossierHeader } from "@/components/dossier-detail/DossierHeader";
import { ChecklistPaperasse } from "@/components/dossier-detail/ChecklistPaperasse";
import { ChatThread } from "@/components/dossier-detail/ChatThread";
import { GedTree } from "@/components/dossier-detail/GedTree";
import { AuditLogList } from "@/components/dossier-detail/AuditLogList";
import { AccessCodeModal } from "@/components/dossier-detail/AccessCodeModal";
import { UnlockDossierButton } from "@/components/dossiers/UnlockDossierButton";
import { DossierAgendaTab } from "@/components/dossier-detail/DossierAgendaTab";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DossierDetailPage() {
  const params = useParams<{ id: string }>();
  const { staffUser, isAssociate } = useAuth();
  const dossiers = useAppStore((s) => s.dossiers);
  const clients = useAppStore((s) => s.clients);
  const users = useAppStore((s) => s.users);
  const tokens = useAppStore((s) => s.accessTokens);

  const dossier = dossiers.find((d) => d.id === params.id);
  if (!dossier) notFound();
  if (!staffUser) return null;

  const canView = canStaffViewDossier(staffUser, dossier, tokens, APP_NOW);

  if (!canView) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-dashed border-slate-200 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-lg text-brand-dark">Accès restreint</p>
          <p className="mt-1 text-sm text-brand-gray">
            Ce dossier ne vous est pas assigné. Si un associé vous a transmis un code temporaire, saisissez-le pour y
            accéder.
          </p>
        </div>
        <UnlockDossierButton />
      </div>
    );
  }

  const client = clients.find((c) => c.id === dossier.clientId);
  const associe = users.find((u) => u.id === dossier.associeReferentId);
  const stagiaires = users.filter((u) => dossier.stagiairesAssignesIds.includes(u.id));

  return (
    <div className="flex flex-col gap-5">
      <DossierHeader dossier={dossier} client={client} associe={associe} stagiaires={stagiaires} />

      {isAssociate && (
        <div className="flex flex-wrap gap-2">
          <AccessCodeModal dossierId={dossier.id} />
          <Link href={`/templates?dossierId=${dossier.id}`}>
            <Button variant="outline" size="sm">
              Générer un acte pour ce dossier
            </Button>
          </Link>
        </div>
      )}

      <Tabs defaultValue="checklist">
        <TabsList className="flex-wrap">
          <TabsTrigger value="checklist">Vue d’ensemble</TabsTrigger>
          <TabsTrigger value="chat">Discussion</TabsTrigger>
          <TabsTrigger value="ged">GED</TabsTrigger>
          <TabsTrigger value="agenda">
            <CalendarPlus className="h-3.5 w-3.5" /> Agenda
          </TabsTrigger>
          <TabsTrigger value="audit">Journal d’audit</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <ErrorBoundary label="Vue d’ensemble">
            <ChecklistPaperasse dossier={dossier} />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="chat">
          <ErrorBoundary label="Discussion">
            <ChatThread dossierId={dossier.id} />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="ged">
          <ErrorBoundary label="GED">
            <GedTree dossierId={dossier.id} />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="agenda">
          <ErrorBoundary label="Agenda">
            <DossierAgendaTab dossierId={dossier.id} />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="audit">
          <ErrorBoundary label="Journal d’audit">
            <AuditLogList dossierId={dossier.id} />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
