"use client";

import * as React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgendaEvent, AgendaEventType } from "@/types/database";

const TYPE_DOT: Record<AgendaEventType, string> = {
  AUDIENCE: "bg-gold-500",
  PARQUET_GREFFE: "bg-navy-700",
  COMMISSARIAT: "bg-rose-500",
  REUNION_CLIENT: "bg-emerald-500",
};

export function CalendarView({
  events,
  selectedDate,
  onSelectDate,
  today,
}: {
  events: AgendaEvent[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  today: Date;
}) {
  const [cursor, setCursor] = React.useState(startOfMonth(selectedDate));

  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const e of events) {
      const key = format(new Date(e.eventDate), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [events]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-base capitalize text-brand-dark">{format(cursor, "MMMM yyyy", { locale: fr })}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor((c) => subMonths(c, 1))} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-dark">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCursor(startOfMonth(today));
              onSelectDate(today);
            }}
            className="rounded px-2 py-1 text-xs text-brand-gray hover:bg-slate-100"
          >
            Aujourd’hui
          </button>
          <button onClick={() => setCursor((c) => addMonths(c, 1))} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-dark">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex h-16 flex-col items-center gap-1 rounded-md border p-1.5 transition-colors",
                isSelected ? "border-gold-500 bg-gold-100/40" : "border-transparent hover:bg-slate-50",
                !inMonth && "opacity-40"
              )}
            >
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs", isToday ? "bg-brand-gold text-brand-dark" : "text-brand-dark")}>
                {format(day, "d")}
              </span>
              <div className="flex gap-0.5">
                {dayEvents.slice(0, 4).map((e, i) => (
                  <span key={i} className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOT[e.type])} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
