"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { PaperasseBadge, RestrictedBadge } from "@/components/shared/DossierStatusBadge";
import type { Dossier, User } from "@/types/database";

export function DossierCard({
  dossier,
  associe,
  stagiaires,
  messageCount,
  onDragStart,
  onStep,
  canGoBack,
  canGoForward,
}: {
  dossier: Dossier;
  associe?: User;
  stagiaires: User[];
  messageCount: number;
  onDragStart: (e: React.DragEvent) => void;
  onStep: (direction: "back" | "forward") => void;
  canGoBack: boolean;
  canGoForward: boolean;
}) {
  return (
    <Card draggable onDragStart={onDragStart} className="cursor-grab p-3 active:cursor-grabbing">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link href={`/dossiers/${dossier.id}`} className="min-w-0">
          <p className="case-code truncate text-[11px] text-slate-400">{dossier.dossierRef}</p>
          <p className="line-clamp-2 text-sm font-medium text-brand-dark hover:text-gold-600">{dossier.titre}</p>
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <PaperasseBadge complete={dossier.paperasseComplete} />
        {dossier.isRestricted && <RestrictedBadge />}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {associe && <Avatar user={associe} size={22} className="ring-2 ring-white" />}
          {stagiaires.map((s) => (
            <Avatar key={s.id} user={s} size={22} className="ring-2 ring-white" />
          ))}
        </div>
        {messageCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <MessageSquare className="h-3 w-3" /> {messageCount}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
        <button
          disabled={!canGoBack}
          onClick={() => onStep("back")}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-dark disabled:opacity-0"
          aria-label="Étape précédente"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          disabled={!canGoForward}
          onClick={() => onStep("forward")}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-dark disabled:opacity-0"
          aria-label="Étape suivante"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}
