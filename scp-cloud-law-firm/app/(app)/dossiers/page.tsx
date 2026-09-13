"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDossierAccess } from "@/hooks/useDossierAccess";
import { KanbanBoard } from "@/components/dossiers/KanbanBoard";
import { DossierListView } from "@/components/dossiers/DossierListView";
import { DossierFormModal } from "@/components/dossiers/DossierFormModal";
import { cn } from "@/lib/utils";

export default function DossiersPage() {
  const { isAssociate } = useAuth();
  const { visibleDossiers } = useDossierAccess();
  const [view, setView] = React.useState<"kanban" | "list">("kanban");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              view === "kanban" ? "bg-white text-brand-dark shadow-sm" : "text-brand-gray"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              view === "list" ? "bg-white text-brand-dark shadow-sm" : "text-brand-gray"
            )}
          >
            <List className="h-3.5 w-3.5" /> Liste
          </button>
        </div>

        {isAssociate && <DossierFormModal />}
      </div>

      {visibleDossiers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">
          Aucun dossier ne vous est actuellement assigné. Utilisez un code de déverrouillage si un associé vous en a
          transmis un.
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard dossiers={visibleDossiers} />
      ) : (
        <DossierListView dossiers={visibleDossiers} />
      )}
    </div>
  );
}
