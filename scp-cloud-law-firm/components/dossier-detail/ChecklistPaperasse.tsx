"use client";

import { Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PaperasseBadge } from "@/components/shared/DossierStatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import type { Dossier } from "@/types/database";

export function ChecklistPaperasse({ dossier }: { dossier: Dossier }) {
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
  const total = dossier.checklistPaperasse.length;
  const done = dossier.checklistPaperasse.filter((i) => i.checked).length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Checklist Paperasse &amp; Pièces</CardTitle>
          <CardDescription>
            {done} / {total} pièces réunies
          </CardDescription>
        </div>
        <PaperasseBadge complete={dossier.paperasseComplete} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={pct} />
        <div className="flex flex-col divide-y divide-slate-100">
          {dossier.checklistPaperasse.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleChecklistItem(dossier.id, item.id)}
              className="flex items-center gap-3 py-2.5 text-left"
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                  item.checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
                )}
              >
                {item.checked && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className={cn("text-sm", item.checked ? "text-slate-400 line-through" : "text-brand-dark")}>
                {item.label}
              </span>
            </button>
          ))}
          {total === 0 && <p className="py-4 text-sm text-slate-400">Aucune pièce définie pour ce dossier.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
