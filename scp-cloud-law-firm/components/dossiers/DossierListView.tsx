"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { DossierStatusBadge, PaperasseBadge, RestrictedBadge } from "@/components/shared/DossierStatusBadge";
import { formatDate } from "@/lib/utils";
import type { Dossier } from "@/types/database";

export function DossierListView({ dossiers }: { dossiers: Dossier[] }) {
  const users = useAppStore((s) => s.users);
  const clients = useAppStore((s) => s.clients);

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr className="text-xs uppercase tracking-wide text-slate-400">
            <th className="px-5 py-3 font-medium">Référence</th>
            <th className="px-5 py-3 font-medium">Client</th>
            <th className="px-5 py-3 font-medium">Étape</th>
            <th className="px-5 py-3 font-medium">Paperasse</th>
            <th className="px-5 py-3 font-medium">Équipe</th>
            <th className="px-5 py-3 font-medium">Mis à jour</th>
          </tr>
        </thead>
        <tbody>
          {dossiers.map((d) => {
            const client = clients.find((c) => c.id === d.clientId);
            const associe = users.find((u) => u.id === d.associeReferentId);
            const stagiaires = users.filter((u) => d.stagiairesAssignesIds.includes(u.id));
            return (
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/dossiers/${d.id}`} className="block">
                    <p className="case-code text-xs text-slate-400">{d.dossierRef}</p>
                    <p className="flex items-center gap-1.5 font-medium text-brand-dark hover:text-gold-600">
                      {d.titre} {d.isRestricted && <RestrictedBadge />}
                    </p>
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {client && (
                    <Link href={`/clients/${client.id}`} className="hover:text-gold-600">
                      {client.nomRaisonSociale}
                      <span className="case-code ml-1 text-xs text-slate-400">({client.codeClient})</span>
                    </Link>
                  )}
                </td>
                <td className="px-5 py-3">
                  <DossierStatusBadge status={d.status} />
                </td>
                <td className="px-5 py-3">
                  <PaperasseBadge complete={d.paperasseComplete} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex -space-x-1.5">
                    {associe && <Avatar user={associe} size={24} className="ring-2 ring-white" />}
                    {stagiaires.map((s) => (
                      <Avatar key={s.id} user={s} size={24} className="ring-2 ring-white" />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">{formatDate(d.updatedAt)}</td>
              </tr>
            );
          })}
          {dossiers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                Aucun dossier à afficher.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
