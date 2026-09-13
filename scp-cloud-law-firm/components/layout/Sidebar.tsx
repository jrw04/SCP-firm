"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CalendarClock,
  Archive,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/shared/Logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  associateOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, associateOnly: true },
  { href: "/clients", label: "Clients", icon: Users, associateOnly: true },
  { href: "/dossiers", label: "Dossiers", icon: FolderKanban },
  { href: "/templates", label: "Modèles d'actes", icon: FileText },
  { href: "/agenda", label: "Agenda judiciaire", icon: CalendarClock },
  { href: "/archives", label: "Affaires classées", icon: Archive, associateOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAssociate } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const items = NAV_ITEMS.filter((item) => !item.associateOnly || isAssociate);

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-brand-gold/20 px-4">
        <Logo variant="icon" height={30} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold tracking-wide text-brand-dark">SCP Cloud Law Firm</p>
            <p className="truncate text-[10px] uppercase tracking-[0.18em] text-brand-gold">Cabinet numérique</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 thin-scrollbar">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-brand-gold/10 text-brand-dark font-medium" : "text-brand-gray hover:bg-slate-50 hover:text-brand-dark"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-gold transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-gold" : "text-slate-400 group-hover:text-brand-gold")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs text-brand-gray hover:text-brand-dark"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && "Réduire"}
      </button>
    </aside>
  );
}
