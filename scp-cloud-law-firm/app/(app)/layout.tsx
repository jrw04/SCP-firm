"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const ASSOCIATE_ONLY_PREFIXES = ["/dashboard", "/clients", "/archives"];

const TITLES: Array<[string, string]> = [
  ["/dashboard", "Tableau de bord"],
  ["/clients", "Clients"],
  ["/dossiers", "Dossiers"],
  ["/templates", "Générateur de documents"],
  ["/agenda", "Agenda judiciaire"],
  ["/archives", "Affaires classées"],
];

function titleFor(pathname: string) {
  const match = TITLES.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"));
  return match?.[1] ?? "SCP Cloud Law Firm";
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAppStore((s) => s.session);

  React.useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    if (session.kind === "CLIENT") {
      router.replace("/extranet");
      return;
    }
    if (
      session.kind === "STAFF" &&
      session.user.role === "INTERN" &&
      ASSOCIATE_ONLY_PREFIXES.some((p) => pathname.startsWith(p))
    ) {
      router.replace("/dossiers");
    }
  }, [session, pathname, router]);

  if (!session || session.kind !== "STAFF") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={titleFor(pathname)} />
        <main className="flex-1 overflow-y-auto thin-scrollbar">
          <div className="mx-auto max-w-7xl p-6">
            <ErrorBoundary label={titleFor(pathname)}>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
