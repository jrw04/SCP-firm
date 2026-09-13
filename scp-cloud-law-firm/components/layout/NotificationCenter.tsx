"use client";

import Link from "next/link";
import { Bell, Mail, CheckCheck } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-brand-dark hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-brand-dark">Notifications</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-dark">
              <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
            </button>
          )}
        </div>
        <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto thin-scrollbar">
          {notifications.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Aucune notification.</p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn("flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-slate-50", !n.read && "bg-gold-100/30")}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={cn("text-sm", !n.read ? "font-semibold text-brand-dark" : "text-slate-600")}>{n.title}</p>
                {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />}
              </div>
              <p className="text-xs text-brand-gray">{n.body}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{formatRelative(n.createdAt)}</span>
                {n.emailSimulated && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> email envoyé (simulation)
                  </span>
                )}
                {n.leadTime && <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{n.leadTime}</Badge>}
              </div>
            </button>
          ))}
        </div>
        {notifications.length > 0 && (
          <div className="border-t border-slate-100 p-2">
            <Link href="/agenda">
              <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                Voir l’agenda
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
