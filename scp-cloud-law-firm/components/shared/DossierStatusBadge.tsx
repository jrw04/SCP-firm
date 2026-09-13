import { CheckCircle2, CircleDashed, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DOSSIER_STATUS_LABELS } from "@/types/database";
import type { DossierStatus } from "@/types/database";

export function DossierStatusBadge({ status }: { status: DossierStatus }) {
  const variant: "navy" | "gold" | "outline" =
    status === "ARCHIVE" ? "navy" : status === "AUDIENCE" || status === "DELIBERE" ? "gold" : "outline";
  return <Badge variant={variant}>{DOSSIER_STATUS_LABELS[status]}</Badge>;
}

export function PaperasseBadge({ complete }: { complete: boolean }) {
  return complete ? (
    <Badge variant="success">
      <CheckCircle2 className="h-3 w-3" /> Paperasse complète
    </Badge>
  ) : (
    <Badge variant="danger">
      <CircleDashed className="h-3 w-3" /> Incomplet
    </Badge>
  );
}

export function RestrictedBadge() {
  return (
    <Badge variant="danger">
      <Lock className="h-3 w-3" /> Dossier sensible
    </Badge>
  );
}
