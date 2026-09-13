"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Logo } from "@/components/shared/Logo";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const logout = useAppStore((s) => s.logout);

  React.useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    if (session.kind === "STAFF") {
      router.replace(session.user.role === "ASSOCIATE" ? "/dashboard" : "/dossiers");
    }
  }, [session, router]);

  if (!session || session.kind !== "CLIENT") return null;
  const client = session.client;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-brand-gold/20 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo variant="icon" height={28} />
            <span className="hidden h-6 w-px bg-slate-200 sm:block" />
            <p className="hidden text-[10px] uppercase tracking-[0.18em] text-brand-gold sm:block">Espace client</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight text-brand-dark">{client.nomRaisonSociale}</p>
              <p className="case-code text-[10px] leading-tight text-brand-gray">{client.codeClient}</p>
            </div>
            <Badge variant="gold" className="hidden md:inline-flex">
              {client.typeClient === "ENTREPRISE" ? "Entreprise" : "Particulier"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="text-brand-gray hover:bg-slate-100 hover:text-brand-dark"
              onClick={() => {
                logout();
                router.push("/");
              }}
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <ErrorBoundary label="Espace client">{children}</ErrorBoundary>
      </main>
    </div>
  );
}
