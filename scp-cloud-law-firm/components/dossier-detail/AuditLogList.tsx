"use client";

import { History, ArrowRightLeft, KeyRound, Unlock, Ban, FileUp, Archive } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { formatDateTime } from "@/lib/utils";

const ACTION_ICONS: Record<string, React.ElementType> = {
  CHANGEMENT_STATUT: ArrowRightLeft,
  GENERATION_CODE_ACCES: KeyRound,
  DEVERROUILLAGE_CODE: Unlock,
  REVOCATION_CODE_ACCES: Ban,
  DEPOT_DOCUMENT: FileUp,
  NOUVELLE_VERSION: FileUp,
  ARCHIVAGE: Archive,
};

export function AuditLogList({ dossierId }: { dossierId: string }) {
  const allLogs = useAppStore((s) => s.auditLogs);
  const logs = allLogs
    .filter((l) => l.dossierId === dossierId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal d’audit</CardTitle>
        <CardDescription>Historique horodaté de toutes les actions sur ce dossier.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-4">
          {logs.map((log) => {
            const Icon = ACTION_ICONS[log.action] ?? History;
            return (
              <li key={log.id} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-gray">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-brand-dark">{log.details}</p>
                  <p className="text-xs text-slate-400">
                    {log.userName} · {formatDateTime(log.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
          {logs.length === 0 && <p className="text-sm text-slate-400">Aucune action enregistrée pour ce dossier.</p>}
        </ol>
      </CardContent>
    </Card>
  );
}
