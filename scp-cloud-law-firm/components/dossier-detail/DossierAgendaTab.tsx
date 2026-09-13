"use client";

import * as React from "react";
import { Plus, MapPin, Clock, BellRing } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventFormModal } from "@/components/agenda/EventFormModal";
import { useAppStore, APP_NOW } from "@/store/useAppStore";
import { AGENDA_EVENT_LABELS } from "@/types/database";
import { formatDateTime } from "@/lib/utils";

const LEAD_TIMES: { hours: number; label: string }[] = [
  { hours: 24 * 7, label: "J-7" },
  { hours: 24 * 2, label: "J-2" },
  { hours: 24, label: "24h" },
  { hours: 2, label: "2h" },
];

function upcomingReminders(eventDate: string): string[] {
  const eventTime = new Date(eventDate).getTime();
  return LEAD_TIMES.filter((l) => eventTime - l.hours * 60 * 60 * 1000 >= APP_NOW.getTime()).map((l) => l.label);
}

export function DossierAgendaTab({ dossierId }: { dossierId: string }) {
  const allEvents = useAppStore((s) => s.agendaEvents);
  const events = allEvents
    .filter((e) => e.dossierId === dossierId)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Agenda du dossier</CardTitle>
          <CardDescription>Audiences, dépôts et rendez-vous liés à ce dossier.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Ajouter un événement
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {events.map((e) => (
          <div key={e.id} className="flex flex-col gap-1 rounded-md border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{AGENDA_EVENT_LABELS[e.type]}</Badge>
                <p className="text-sm font-medium text-brand-dark">{e.title}</p>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDateTime(e.eventDate)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {e.location}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-gold-600">
                <BellRing className="h-3 w-3" />
                {(() => {
                  const reminders = upcomingReminders(e.eventDate);
                  return reminders.length > 0
                    ? `Rappels prévus : ${reminders.join(", ")} avant`
                    : "Tous les rappels programmés sont déjà passés";
                })()}
              </p>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-400">Aucun événement planifié pour ce dossier.</p>}
      </CardContent>

      <EventFormModal open={open} onOpenChange={setOpen} defaultDossierId={dossierId} />
    </Card>
  );
}
