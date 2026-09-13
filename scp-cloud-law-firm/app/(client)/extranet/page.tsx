"use client";

import * as React from "react";
import { FileText, Megaphone, FolderOpen } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DossierStatusBadge } from "@/components/shared/DossierStatusBadge";
import { ExtranetTimeline } from "@/components/extranet/ExtranetTimeline";
import { formatDate, formatDateTime } from "@/lib/utils";
import { GED_FOLDERS } from "@/types/database";

const FOLDER_LABELS: Record<string, string> = {
  "01_Pieces_Client": "Pièces client",
  "02_Actes_Et_Procedure": "Actes & procédure",
  "03_Correspondances": "Correspondances",
  "04_Decisions_Et_Jugements": "Décisions & jugements",
};

export default function ExtranetPage() {
  const { clientAccount } = useAuth();
  const dossiers = useAppStore((s) => s.dossiers);
  const messages = useAppStore((s) => s.messages);
  const gedFiles = useAppStore((s) => s.gedFiles);

  const myDossiers = clientAccount ? dossiers.filter((d) => d.clientId === clientAccount.id) : [];
  const [selectedId, setSelectedId] = React.useState(myDossiers[0]?.id);
  const dossier = myDossiers.find((d) => d.id === selectedId) ?? myDossiers[0];

  if (!clientAccount) return null;

  if (myDossiers.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-slate-400">Aucun dossier n’est encore associé à votre compte.</Card>
    );
  }

  const publicNotes = dossier
    ? messages.filter((m) => m.dossierId === dossier.id && m.isPublicToClient).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  const sharedFiles = dossier ? gedFiles.filter((f) => f.dossierId === dossier.id && f.sharedWithClient) : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl text-brand-dark">Bienvenue, {clientAccount.nomRaisonSociale}</h1>
        <p className="text-sm text-brand-gray">Suivez ici l’avancement de vos dossiers auprès du cabinet.</p>
      </div>

      {myDossiers.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {myDossiers.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedId(d.id)}
              className={`case-code rounded-full border px-3 py-1.5 text-xs transition-colors ${
                d.id === dossier?.id ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-slate-200 bg-white text-brand-gray hover:border-slate-300"
              }`}
            >
              {d.dossierRef}
            </button>
          ))}
        </div>
      )}

      {dossier && (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <p className="case-code text-xs text-gold-600">{dossier.dossierRef}</p>
                <CardTitle className="mt-1">{dossier.titre}</CardTitle>
                <CardDescription>Ouvert le {formatDate(dossier.createdAt)}</CardDescription>
              </div>
              <DossierStatusBadge status={dossier.status} />
            </CardHeader>
            <CardContent>
              <ExtranetTimeline status={dossier.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-gold-600" />
                <CardTitle>Notes du cabinet</CardTitle>
              </div>
              <CardDescription>Points d’étape partagés par votre avocat.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {publicNotes.map((n) => (
                <div key={n.id} className="rounded-md border border-slate-100 p-3">
                  <p className="text-sm text-brand-dark">{n.content}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {n.authorName} · {formatDateTime(n.createdAt)}
                  </p>
                </div>
              ))}
              {publicNotes.length === 0 && <p className="text-sm text-slate-400">Aucune note publiée pour le moment.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-gold-600" />
                <CardTitle>Documents partagés</CardTitle>
              </div>
              <CardDescription>Pièces officielles mises à disposition par le cabinet.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {GED_FOLDERS.map((folder) => {
                const files = sharedFiles.filter((f) => f.folder === folder);
                if (files.length === 0) return null;
                return (
                  <div key={folder}>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{FOLDER_LABELS[folder]}</p>
                    <div className="flex flex-col gap-1.5">
                      {files.map((f) => {
                        const current = f.versions[f.versions.length - 1];
                        return (
                          <div key={f.id} className="flex items-center gap-2 rounded-md border border-slate-100 p-2.5">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-brand-dark">{current.fileName}</p>
                              <p className="text-[11px] text-slate-400">{formatDate(current.uploadedAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {sharedFiles.length === 0 && <p className="text-sm text-slate-400">Aucun document partagé pour le moment.</p>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
