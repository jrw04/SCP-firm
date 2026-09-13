"use client";

import { Users, FolderKanban, Archive, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/dashboard/StatsCards";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { DossierStageChart, DossiersByAssociateChart } from "@/components/dashboard/DossierCharts";

export default function DashboardPage() {
  const users = useAppStore((s) => s.users);
  const clients = useAppStore((s) => s.clients);
  const dossiers = useAppStore((s) => s.dossiers);

  const associates = users.filter((u) => u.role === "ASSOCIATE");
  const interns = users.filter((u) => u.role === "INTERN");
  const activeDossiers = dossiers.filter((d) => d.status !== "ARCHIVE");
  const archivedDossiers = dossiers.filter((d) => d.status === "ARCHIVE");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Utilisateurs actifs" value={users.length} sublabel={`${associates.length} associés · ${interns.length} stagiaires`} icon={Users} accent="navy" />
        <StatCard label="Clients" value={clients.length} sublabel="Toutes catégories confondues" icon={ShieldCheck} accent="gold" />
        <StatCard label="Dossiers actifs" value={activeDossiers.length} sublabel="Hors dossiers archivés" icon={FolderKanban} accent="emerald" />
        <StatCard label="Dossiers archivés" value={archivedDossiers.length} sublabel="Affaires classées" icon={Archive} accent="rose" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DossierStageChart dossiers={dossiers} />
        <DossiersByAssociateChart dossiers={dossiers} associates={associates} />
      </div>

      <PerformanceTable interns={interns} dossiers={dossiers} />
    </div>
  );
}
