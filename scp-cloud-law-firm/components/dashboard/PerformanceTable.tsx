import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { User, Dossier } from "@/types/database";

function averageDelayDays(dossiers: Dossier[]): number | null {
  const completed = dossiers.filter((d) => d.paperasseComplete);
  if (completed.length === 0) return null;
  const totalDays = completed.reduce((sum, d) => {
    const days = (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return sum + Math.max(days, 0);
  }, 0);
  return totalDays / completed.length;
}

export function PerformanceTable({ interns, dossiers }: { interns: User[]; dossiers: Dossier[] }) {
  const rows = interns.map((intern) => {
    const assigned = dossiers.filter((d) => d.stagiairesAssignesIds.includes(intern.id));
    const active = assigned.filter((d) => d.status !== "ARCHIVE");
    const avgDelay = averageDelayDays(assigned);
    return { intern, total: assigned.length, active: active.length, avgDelay };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charge de travail par stagiaire</CardTitle>
        <CardDescription>Nombre de dossiers gérés et délai moyen de traitement de la paperasse.</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 font-medium">Stagiaire</th>
              <th className="pb-2 font-medium">Dossiers actifs</th>
              <th className="pb-2 font-medium">Total dossiers</th>
              <th className="pb-2 font-medium">Délai moyen paperasse</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ intern, total, active, avgDelay }) => (
              <tr key={intern.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Avatar user={intern} size={26} />
                    <span className="text-brand-dark">{intern.name}</span>
                  </div>
                </td>
                <td className="py-3 text-brand-dark">{active}</td>
                <td className="py-3 text-brand-gray">{total}</td>
                <td className="py-3 text-brand-gray">{avgDelay !== null ? `${avgDelay.toFixed(1)} j` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
