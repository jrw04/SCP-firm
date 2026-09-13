"use client";

import Link from "next/link";
import { Building2, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Client, Dossier } from "@/types/database";

export function ClientTable({ clients, dossiers }: { clients: Client[]; dossiers: Dossier[] }) {
  if (clients.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-slate-400">Aucun client ne correspond à cette recherche.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr className="text-xs uppercase tracking-wide text-slate-400">
            <th className="px-5 py-3 font-medium">Code</th>
            <th className="px-5 py-3 font-medium">Nom / Raison sociale</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="px-5 py-3 font-medium">Dossiers</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => {
            const count = dossiers.filter((d) => d.clientId === c.id).length;
            return (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/clients/${c.id}`} className="case-code font-medium text-brand-dark hover:text-gold-600">
                    {c.codeClient}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/clients/${c.id}`} className="text-brand-dark hover:text-gold-600">
                    {c.nomRaisonSociale}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className="gap-1">
                    {c.typeClient === "ENTREPRISE" ? <Building2 className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                    {c.typeClient === "ENTREPRISE" ? "Entreprise" : "Particulier"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-brand-gray">
                  <p>{c.email}</p>
                  <p className="text-xs text-slate-400">{c.telephone}</p>
                </td>
                <td className="px-5 py-3 text-brand-dark">{count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
