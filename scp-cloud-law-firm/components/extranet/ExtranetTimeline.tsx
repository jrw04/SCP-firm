import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOSSIER_STATUS_ORDER, DOSSIER_STATUS_LABELS } from "@/types/database";
import type { DossierStatus } from "@/types/database";

export function ExtranetTimeline({ status }: { status: DossierStatus }) {
  const currentIndex = DOSSIER_STATUS_ORDER.indexOf(status);

  return (
    <div className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {DOSSIER_STATUS_ORDER.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const label = DOSSIER_STATUS_LABELS[s].replace(/^\d\.\s*/, "");
        return (
          <div key={s} className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center sm:gap-2">
            <div className="flex items-center sm:w-full">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  active && "border-brand-gold bg-brand-gold text-brand-dark",
                  !done && !active && "border-slate-200 bg-white text-slate-400"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < DOSSIER_STATUS_ORDER.length - 1 && (
                <span className={cn("hidden h-0.5 flex-1 sm:block", done ? "bg-emerald-500" : "bg-slate-200")} />
              )}
            </div>
            <p className={cn("text-xs sm:text-center", active ? "font-medium text-brand-dark" : "text-slate-400")}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}
