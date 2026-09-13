"use client";

import * as React from "react";
import { KeyRound, Ban, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppStore, APP_NOW } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import type { AccessCodeDuration } from "@/services/codeGenerator";
import { formatDateTime, cn } from "@/lib/utils";

const DURATIONS: { value: AccessCodeDuration; label: string }[] = [
  { value: "12H", label: "12 heures" },
  { value: "24H", label: "24 heures" },
  { value: "48H", label: "48 heures" },
  { value: "7D", label: "7 jours" },
  { value: "CUSTOM", label: "Date/heure personnalisée" },
];

export function AccessCodeModal({ dossierId }: { dossierId: string }) {
  const { staffUser } = useAuth();
  const users = useAppStore((s) => s.users);
  const tokens = useAppStore((s) => s.accessTokens).filter((t) => t.dossierId === dossierId);
  const generateAccessToken = useAppStore((s) => s.generateAccessToken);
  const revokeAccessToken = useAppStore((s) => s.revokeAccessToken);

  const interns = users.filter((u) => u.role === "INTERN");

  const [open, setOpen] = React.useState(false);
  const [stagiaireId, setStagiaireId] = React.useState(interns[0]?.id ?? "");
  const [duration, setDuration] = React.useState<AccessCodeDuration>("24H");
  const [customDate, setCustomDate] = React.useState("");
  const [issued, setIssued] = React.useState<string | null>(null);

  function handleGenerate() {
    if (!staffUser || !stagiaireId) return;
    const custom = duration === "CUSTOM" && customDate ? new Date(customDate) : undefined;
    const token = generateAccessToken(dossierId, stagiaireId, duration, custom, staffUser.id);
    setIssued(token.tokenCode);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setIssued(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="h-3.5 w-3.5" /> Générer un code d’accès stagiaire
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Code d’accès temporaire</DialogTitle>
          <DialogDescription>Débloque ce dossier pour un stagiaire non assigné, pour une durée limitée.</DialogDescription>
        </DialogHeader>

        {issued ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 p-6 text-center">
            <p className="text-xs text-emerald-700">Code généré — transmettez-le au stagiaire concerné</p>
            <p className="case-code text-2xl font-semibold tracking-widest text-brand-dark">{issued}</p>
            <Button variant="ghost" size="sm" onClick={() => setIssued(null)}>
              Générer un autre code
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stagiaire">Stagiaire</Label>
              <Select value={stagiaireId} onValueChange={setStagiaireId}>
                <SelectTrigger id="stagiaire">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interns.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Durée</Label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      duration === d.value ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-slate-200 text-brand-gray hover:border-slate-300"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {duration === "CUSTOM" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customDate">Expire le</Label>
                <input
                  id="customDate"
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 px-2 text-sm text-brand-dark"
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="gold" onClick={handleGenerate} disabled={!stagiaireId || (duration === "CUSTOM" && !customDate)}>
                Générer le code
              </Button>
            </DialogFooter>
          </div>
        )}

        {tokens.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Codes émis</p>
            <div className="flex flex-col gap-1.5">
              {tokens.map((t) => {
                const intern = users.find((u) => u.id === t.stagiaireId);
                const expired = new Date(t.expiresAt).getTime() < APP_NOW.getTime();
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-xs">
                    <div>
                      <span className="case-code font-medium text-brand-dark">{t.tokenCode}</span>
                      <span className="ml-2 text-slate-400">{intern?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!t.isActive ? (
                        <Badge variant="outline" className="text-[10px]">Révoqué</Badge>
                      ) : expired ? (
                        <Badge variant="danger" className="gap-1 text-[10px]">
                          <Clock className="h-2.5 w-2.5" /> Expiré
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px]">Actif · {formatDateTime(t.expiresAt)}</Badge>
                      )}
                      {t.isActive && !expired && staffUser && (
                        <button onClick={() => revokeAccessToken(t.id, staffUser.id)} className="text-slate-400 hover:text-rose-600">
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
