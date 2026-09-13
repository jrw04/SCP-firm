import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = "navy",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ElementType;
  accent?: "navy" | "gold" | "emerald" | "rose";
}) {
  const accentClasses: Record<string, string> = {
    navy: "bg-brand-dark text-white",
    gold: "bg-brand-gold/10 text-brand-gold",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <Card className="flex items-start justify-between p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-gray">{label}</p>
        <p className="mt-2 font-display text-3xl font-semibold text-brand-dark">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-brand-gray">{sublabel}</p>}
      </div>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accentClasses[accent])}>
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}
