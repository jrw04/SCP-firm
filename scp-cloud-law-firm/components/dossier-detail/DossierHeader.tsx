"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DossierStatusBadge, PaperasseBadge, RestrictedBadge } from "@/components/shared/DossierStatusBadge";
import { formatDate } from "@/lib/utils";
import type { Dossier, Client, User } from "@/types/database";

export function DossierHeader({
  dossier,
  client,
  associe,
  stagiaires,
}: {
  dossier: Dossier;
  client?: Client;
  associe?: User;
  stagiaires: User[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="letterhead-rule" />
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="case-code text-xs font-medium text-gold-600">{dossier.dossierRef}</p>
            <h1 className="mt-1 font-display text-2xl text-brand-dark">{dossier.titre}</h1>
            <p className="mt-1 text-xs text-slate-400">
              Ouvert le {formatDate(dossier.createdAt)} · Mis à jour le {formatDate(dossier.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DossierStatusBadge status={dossier.status} />
            <PaperasseBadge complete={dossier.paperasseComplete} />
            {dossier.isRestricted && <RestrictedBadge />}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Client</p>
            {client && (
              <Link href={`/clients/${client.id}`} className="mt-1 flex items-center gap-1.5 text-sm text-brand-dark hover:text-gold-600">
                {client.nomRaisonSociale}
                <Badge variant="outline" className="case-code px-1.5 py-0 text-[10px]">
                  {client.codeClient}
                </Badge>
              </Link>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Avocat référent</p>
            {associe && (
              <div className="mt-1 flex items-center gap-2">
                <Avatar user={associe} size={22} />
                <span className="text-sm text-brand-dark">{associe.name}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Stagiaires assignés</p>
            <div className="mt-1 flex items-center gap-2">
              {stagiaires.length > 0 ? (
                stagiaires.map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5">
                    <Avatar user={s} size={22} />
                    <span className="text-sm text-brand-dark">{s.name}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-slate-400">Aucun</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
