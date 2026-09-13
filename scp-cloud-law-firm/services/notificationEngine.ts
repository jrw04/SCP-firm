import type { AgendaEvent, AppNotification, NotificationLeadTime } from "@/types/database";
import { AGENDA_EVENT_LABELS } from "@/types/database";

const LEAD_TIMES: { key: NotificationLeadTime; hours: number; label: string }[] = [
  { key: "J-7", hours: 24 * 7, label: "dans 7 jours" },
  { key: "J-2", hours: 24 * 2, label: "dans 2 jours" },
  { key: "24H", hours: 24, label: "demain" },
  { key: "2H", hours: 2, label: "dans 2 heures" },
];

/**
 * Builds the four scheduled reminder notifications for a newly created
 * (or edited) agenda event, one per recipient per lead time whose window
 * has not already passed relative to `now`.
 */
export function scheduleNotificationsForEvent(event: AgendaEvent, now: Date): Omit<AppNotification, "id">[] {
  const eventTime = new Date(event.eventDate).getTime();
  const out: Omit<AppNotification, "id">[] = [];

  for (const lead of LEAD_TIMES) {
    const fireTime = eventTime - lead.hours * 60 * 60 * 1000;
    if (fireTime < now.getTime()) continue; // window already elapsed

    for (const userId of event.notifiedUserIds) {
      out.push({
        userId,
        title: `${AGENDA_EVENT_LABELS[event.type]} ${lead.label}`,
        body: `${event.title} — ${event.location}`,
        dossierId: event.dossierId,
        eventId: event.id,
        leadTime: lead.key,
        createdAt: now.toISOString(),
        read: false,
        emailSimulated: true,
      });
    }
  }
  return out;
}
