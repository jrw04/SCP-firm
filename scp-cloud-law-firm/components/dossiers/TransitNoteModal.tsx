"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DOSSIER_STATUS_LABELS } from "@/types/database";
import type { DossierStatus } from "@/types/database";

export function TransitNoteModal({
  open,
  onOpenChange,
  fromStatus,
  toStatus,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fromStatus: DossierStatus | null;
  toStatus: DossierStatus | null;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note de transit obligatoire</DialogTitle>
          <DialogDescription>
            {fromStatus && toStatus && (
              <>
                Passage de <strong className="text-brand-dark">{DOSSIER_STATUS_LABELS[fromStatus]}</strong> à{" "}
                <strong className="text-brand-dark">{DOSSIER_STATUS_LABELS[toStatus]}</strong>. Cette action est consignée
                dans le journal d’audit.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="transit-note">Note</Label>
          <Textarea
            id="transit-note"
            placeholder="Ex. Dossier déposé au Parquet par le stagiaire X, récépissé n°882."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="gold"
            disabled={note.trim().length < 3}
            onClick={() => {
              onConfirm(note.trim());
              onOpenChange(false);
            }}
          >
            Confirmer le changement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
