"use client";

import { useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UnlockDossierButton } from "@/components/dossiers/UnlockDossierButton";
import { Logo } from "@/components/shared/Logo";

const ROLE_LABEL: Record<string, string> = {
  ASSOCIATE: "Avocat associé",
  INTERN: "Stagiaire",
};

export function Navbar({ title }: { title?: string }) {
  const router = useRouter();
  const { staffUser, logout, isIntern } = useAuth();

  if (!staffUser) return null;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-brand-gold/20 bg-white px-6">
      <div className="flex items-center gap-3">
        <Logo variant="icon" height={26} />
        <span className="h-6 w-px bg-slate-200" />
        <h1 className="font-display text-lg font-medium text-brand-dark">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {isIntern && <UnlockDossierButton />}
        <NotificationCenter />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100">
              <Avatar user={staffUser} size={30} />
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight text-brand-dark">{staffUser.name}</p>
                <p className="text-[10px] leading-tight text-brand-gray">{ROLE_LABEL[staffUser.role]}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <span>{staffUser.name}</span>
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {ROLE_LABEL[staffUser.role]}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                logout();
                router.push("/");
              }}
              className="text-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
