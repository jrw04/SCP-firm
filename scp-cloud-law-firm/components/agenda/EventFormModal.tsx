"use client";

import * as React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { AGENDA_EVENT_LABELS } from "@/types/database";
import type { AgendaEventType } from "@/types/database";

const schema = z.object({
  title: z.string().min(3, "Titre requis"),
  type: z.enum(["REUNION_CLIENT", "PARQUET_GREFFE", "COMMISSARIAT", "AUDIENCE"]),
  dossierId: z.string().min(1, "Dossier requis"),
  eventDate: z.string().min(1, "Date requise"),
  location: z.string().min(2, "Lieu requis"),
});

type FormValues = z.infer<typeof schema>;

export function EventFormModal({
  open,
  onOpenChange,
  defaultDossierId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDossierId?: string;
}) {
  const dossiers = useAppStore((s) => s.dossiers);
  const addAgendaEvent = useAppStore((s) => s.addAgendaEvent);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "REUNION_CLIENT", dossierId: defaultDossierId ?? "" },
  });

  const selectedDossierId = useWatch({ control, name: "dossierId" });

  function onSubmit(values: FormValues) {
    const dossier = dossiers.find((d) => d.id === values.dossierId);
    const notifiedUserIds = dossier ? [dossier.associeReferentId, ...dossier.stagiairesAssignesIds] : [];
    addAgendaEvent({
      title: values.title,
      type: values.type as AgendaEventType,
      dossierId: values.dossierId,
      eventDate: new Date(values.eventDate).toISOString(),
      location: values.location,
      notifiedUserIds,
    });
    reset({ type: "REUNION_CLIENT", dossierId: defaultDossierId ?? "", title: "", eventDate: "", location: "" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel événement</DialogTitle>
          <DialogDescription>
            Des rappels seront programmés automatiquement à J-7, J-2, 24h et 2h pour l’associé et les stagiaires du
            dossier.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" placeholder="Ex. Audience correctionnelle" {...register("title")} />
            {errors.title && <p className="text-xs text-rose-600">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AGENDA_EVENT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dossierId">Dossier</Label>
              <Controller
                control={control}
                name="dossierId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!!defaultDossierId}>
                    <SelectTrigger id="dossierId">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {dossiers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.dossierRef}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.dossierId && <p className="text-xs text-rose-600">{errors.dossierId.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eventDate">Date &amp; heure</Label>
            <input
              id="eventDate"
              type="datetime-local"
              {...register("eventDate")}
              className="h-9 rounded-md border border-slate-200 px-2 text-sm text-brand-dark"
            />
            {errors.eventDate && <p className="text-xs text-rose-600">{errors.eventDate.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Lieu</Label>
            <Input id="location" placeholder="Ex. Tribunal de Grande Instance, Yaoundé" {...register("location")} />
            {errors.location && <p className="text-xs text-rose-600">{errors.location.message}</p>}
          </div>

          {selectedDossierId && (
            <p className="text-xs text-slate-400">
              Notifiés : l’associé référent et les stagiaires assignés au dossier sélectionné.
            </p>
          )}

          <DialogFooter>
            <Button type="submit" variant="gold">
              Planifier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
