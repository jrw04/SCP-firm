"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";

export function UnlockDossierButton() {
  const router = useRouter();
  const { staffUser } = useAuth();
  const redeemAccessCode = useAppStore((s) => s.redeemAccessCode);

  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [feedback, setFeedback] = React.useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!staffUser) return;
    const res = redeemAccessCode(code, staffUser.id);
    setFeedback({ ok: res.ok, message: res.message });
    if (res.ok && res.dossierId) {
      setTimeout(() => {
        setOpen(false);
        setCode("");
        setFeedback(null);
        router.push(`/dossiers/${res.dossierId}`);
      }, 700);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="h-3.5 w-3.5" /> Saisir un code de déverrouillage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Déverrouiller un dossier</DialogTitle>
          <DialogDescription>Saisissez le code temporaire transmis par un avocat associé.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unlock-code">Code d’accès</Label>
            <Input
              id="unlock-code"
              className="case-code text-center text-base tracking-widest"
              placeholder="XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
              required
            />
          </div>
          {feedback && (
            <p className={feedback.ok ? "text-xs text-emerald-600" : "text-xs text-rose-600"}>{feedback.message}</p>
          )}
          <DialogFooter>
            <Button type="submit" variant="gold">
              Déverrouiller
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
