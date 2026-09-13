"use client";

import * as React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { DossierCard } from "@/components/dossiers/DossierCard";
import { TransitNoteModal } from "@/components/dossiers/TransitNoteModal";
import { DOSSIER_STATUS_ORDER, DOSSIER_STATUS_LABELS } from "@/types/database";
import type { Dossier, DossierStatus } from "@/types/database";
import { cn } from "@/lib/utils";

export function KanbanBoard({ dossiers }: { dossiers: Dossier[] }) {
  const users = useAppStore((s) => s.users);
  const messages = useAppStore((s) => s.messages);
  const moveDossierStatus = useAppStore((s) => s.moveDossierStatus);
  const { staffUser } = useAuth();

  const [dragOverStatus, setDragOverStatus] = React.useState<DossierStatus | null>(null);
  const [pending, setPending] = React.useState<{ dossierId: string; from: DossierStatus; to: DossierStatus } | null>(null);

  function requestMove(dossierId: string, from: DossierStatus, to: DossierStatus) {
    if (from === to) return;
    setPending({ dossierId, from, to });
  }

  function confirmMove(note: string) {
    if (!pending || !staffUser) return;
    moveDossierStatus(pending.dossierId, pending.to, note, staffUser.id);
    setPending(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 thin-scrollbar">
      {DOSSIER_STATUS_ORDER.map((status, colIndex) => {
        const items = dossiers.filter((d) => d.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStatus(status);
            }}
            onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const dossierId = e.dataTransfer.getData("text/dossier-id");
              const from = e.dataTransfer.getData("text/from-status") as DossierStatus;
              setDragOverStatus(null);
              if (dossierId && from) requestMove(dossierId, from, status);
            }}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border bg-slate-100/60 transition-colors",
              dragOverStatus === status ? "border-gold-500 bg-gold-100/40" : "border-slate-200"
            )}
          >
            <div className="flex items-center justify-between px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                {DOSSIER_STATUS_LABELS[status]}
              </p>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-brand-gray shadow-sm">
                {items.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
              {items.map((d) => {
                const associe = users.find((u) => u.id === d.associeReferentId);
                const stagiaires = users.filter((u) => d.stagiairesAssignesIds.includes(u.id));
                const messageCount = messages.filter((m) => m.dossierId === d.id).length;
                return (
                  <DossierCard
                    key={d.id}
                    dossier={d}
                    associe={associe}
                    stagiaires={stagiaires}
                    messageCount={messageCount}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/dossier-id", d.id);
                      e.dataTransfer.setData("text/from-status", d.status);
                    }}
                    canGoBack={colIndex > 0}
                    canGoForward={colIndex < DOSSIER_STATUS_ORDER.length - 1}
                    onStep={(direction) => {
                      const nextIndex = direction === "forward" ? colIndex + 1 : colIndex - 1;
                      const nextStatus = DOSSIER_STATUS_ORDER[nextIndex];
                      if (nextStatus) requestMove(d.id, d.status, nextStatus);
                    }}
                  />
                );
              })}
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-slate-400">Aucun dossier à cette étape.</p>
              )}
            </div>
          </div>
        );
      })}

      <TransitNoteModal
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
        fromStatus={pending?.from ?? null}
        toStatus={pending?.to ?? null}
        onConfirm={confirmMove}
      />
    </div>
  );
}
