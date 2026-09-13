"use client";

import * as React from "react";
import Link from "next/link";
import { isSameDay } from "date-fns";
import { Plus, MapPin, Clock, ChevronRight } from "lucide-react";
import { useAppStore, APP_NOW } from "@/store/useAppStore";
import { useDossierAccess } from "@/hooks/useDossierAccess";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/agenda/CalendarView";
import { EventFormModal } from "@/components/agenda/EventFormModal";
import { AGENDA_EVENT_LABELS } from "@/types/database";
import { formatDateTime, formatDate } from "@/lib/utils";

export default function AgendaPage() {
  const { isAssociate } = useAuth();
  const { visibleDossiers } = useDossierAccess();
  const allEvents = useAppStore((s) => s.agendaEvents);
  const visibleDossierIds = new Set(visibleDossiers.map((d) => d.id));
  const events = isAssociate ? allEvents : allEvents.filter((e) => visibleDossierIds.has(e.dossierId));

  const [selectedDate, setSelectedDate] = React.useState(APP_NOW);
  const [open, setOpen] = React.useState(false);

  const dayEvents = events
    .filter((e) => isSameDay(new Date(e.eventDate), selectedDate))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const upcoming = events
    .filter((e) => new Date(e.eventDate).getTime() >= APP_NOW.getTime())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Button variant="gold" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Ajouter un événement
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card className="p-5">
          <CalendarView events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} today={APP_NOW} />
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{formatDate(selectedDate.toISOString(), { weekday: "long", day: "2-digit", month: "long" })}</CardTitle>
              <CardDescription>{dayEvents.length} événement(s)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {dayEvents.map((e) => (
                <EventRow key={e.id} eventId={e.id} />
              ))}
              {dayEvents.length === 0 && <p className="text-sm text-slate-400">Aucun événement ce jour-là.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prochains événements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {upcoming.map((e) => (
                <EventRow key={e.id} eventId={e.id} compact />
              ))}
              {upcoming.length === 0 && <p className="text-sm text-slate-400">Rien de planifié à venir.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <EventFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function EventRow({ eventId, compact }: { eventId: string; compact?: boolean }) {
  const event = useAppStore((s) => s.agendaEvents.find((e) => e.id === eventId));
  const dossier = useAppStore((s) => s.dossiers.find((d) => d.id === event?.dossierId));
  if (!event) return null;

  return (
    <Link
      href={dossier ? `/dossiers/${dossier.id}` : "#"}
      className="flex items-center justify-between gap-2 rounded-md border border-slate-100 p-3 hover:border-gold-500 hover:bg-gold-100/20"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{AGENDA_EVENT_LABELS[event.type]}</Badge>
          {dossier && <span className="case-code truncate text-[11px] text-slate-400">{dossier.dossierRef}</span>}
        </div>
        <p className="mt-0.5 truncate text-sm font-medium text-brand-dark">{event.title}</p>
        {!compact && (
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDateTime(event.eventDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {event.location}
            </span>
          </div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
  );
}
