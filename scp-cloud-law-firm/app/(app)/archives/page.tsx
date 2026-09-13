"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DossierListView } from "@/components/dossiers/DossierListView";

export default function ArchivesPage() {
  const dossiers = useAppStore((s) => s.dossiers);
  const clients = useAppStore((s) => s.clients);
  const users = useAppStore((s) => s.users);
  const associates = users.filter((u) => u.role === "ASSOCIATE");

  const archived = dossiers.filter((d) => d.status === "ARCHIVE");
  const years = Array.from(new Set(archived.map((d) => new Date(d.createdAt).getUTCFullYear().toString()))).sort().reverse();

  const [query, setQuery] = React.useState("");
  const [year, setYear] = React.useState<string>("ALL");
  const [associeId, setAssocieId] = React.useState<string>("ALL");

  const filtered = archived.filter((d) => {
    const client = clients.find((c) => c.id === d.clientId);
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      d.dossierRef.toLowerCase().includes(q) ||
      d.titre.toLowerCase().includes(q) ||
      client?.codeClient.toLowerCase().includes(q) ||
      client?.nomRaisonSociale.toLowerCase().includes(q);
    const matchesYear = year === "ALL" || new Date(d.createdAt).getUTCFullYear().toString() === year;
    const matchesAssocie = associeId === "ALL" || d.associeReferentId === associeId;
    return matchesQuery && matchesYear && matchesAssocie;
  });

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q">Recherche (code client, réf., titre)</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input id="q" className="pl-9" placeholder="Ex. CBC-101" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="year">Année</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes les années</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="associe">Avocat référent</Label>
            <Select value={associeId} onValueChange={setAssocieId}>
              <SelectTrigger id="associe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les associés</SelectItem>
                {associates.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <p className="text-xs text-slate-400">{filtered.length} affaire(s) classée(s) trouvée(s)</p>
      <DossierListView dossiers={filtered} />
    </div>
  );
}
