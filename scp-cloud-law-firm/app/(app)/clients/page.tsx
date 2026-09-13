"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientFormModal } from "@/components/clients/ClientFormModal";

export default function ClientsPage() {
  const clients = useAppStore((s) => s.clients);
  const dossiers = useAppStore((s) => s.dossiers);
  const [query, setQuery] = React.useState("");

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.nomRaisonSociale.toLowerCase().includes(q) ||
      c.codeClient.toLowerCase().includes(q) ||
      c.telephone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
    );
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher un nom, code ou téléphone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <ClientFormModal />
      </div>

      <ClientTable clients={filtered} dossiers={dossiers} />
    </div>
  );
}
