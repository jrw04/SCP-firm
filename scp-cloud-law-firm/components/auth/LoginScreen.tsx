"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, GraduationCap, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Logo } from "@/components/shared/Logo";

type RoleTab = "ASSOCIATE" | "TEAM MEMBERS" | "CLIENT";

export function LoginScreen() {
  const router = useRouter();
  const users = useAppStore((s) => s.users);
  const loginStaff = useAppStore((s) => s.loginStaff);
  const loginClient = useAppStore((s) => s.loginClient);

  const [tab, setTab] = React.useState<RoleTab>("ASSOCIATE");
  const [codeClient, setCodeClient] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const associates = users.filter((u) => u.role === "ASSOCIATE");
  const interns = users.filter((u) => u.role === "TEAM MEMBERS");

  function handleStaffLogin(userId: string) {
    const user = users.find((u) => u.id === userId);
    loginStaff(userId);
    router.push(user?.role === "ASSOCIATE" ? "/dashboard" : "/dossiers");
  }

  function handleClientLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = loginClient(codeClient, email);
    if (!res.ok) {
      setError(res.message ?? "Identifiants invalides.");
      return;
    }
    setError(null);
    router.push("/extranet");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Letterhead panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-dark p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent, transparent 38px, rgba(197,160,89,0.6) 38px, rgba(197,160,89,0.6) 39px)",
          }}
        />
        <div className="relative">
          <Logo variant="icon" height={40} withWordmark tone="light" />
        </div>

        <div className="relative max-w-md">
          <div className="letterhead-rule mb-6 w-24" />
          <p className="font-display text-3xl leading-snug text-slate-100">
            Chaque dossier mérite la rigueur d’une chemise papier
            <span className="text-brand-gold">, et la traçabilité du numérique.</span>
          </p>
          <div className="letterhead-rule mt-6 w-24" />
        </div>

        <p className="relative text-xs text-slate-400">
          Accès réservé aux associés, stagiaires et clients du cabinet. Toute action est horodatée et consignée.
        </p>
      </div>

      {/* Login panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Logo variant="full" height={60} />
          </div>

          <h1 className="font-display text-2xl font-medium text-brand-dark">Connexion</h1>
          <p className="mb-6 text-sm text-brand-gray">Sélectionnez votre profil pour accéder à la plateforme.</p>

          <Tabs value={tab} onValueChange={(v) => setTab(v as RoleTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ASSOCIATE">
                <ShieldCheck className="h-3.5 w-3.5" /> Associé
              </TabsTrigger>
              <TabsTrigger value="INTERN">
                <GraduationCap className="h-3.5 w-3.5" /> Stagiaire
              </TabsTrigger>
              <TabsTrigger value="CLIENT">
                <Users className="h-3.5 w-3.5" /> Client
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ASSOCIATE">
              <p className="mb-3 text-xs text-brand-gray">Accès complet : dossiers, clients, statistiques, archives.</p>
              <div className="flex flex-col gap-2">
                {associates.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStaffLogin(u.id)}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-brand-gold hover:bg-brand-gold/5"
                  >
                    <Avatar user={u} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-dark">{u.name}</p>
                      <p className="truncate text-xs text-brand-gray">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="INTERN">
              <p className="mb-3 text-xs text-brand-gray">Accès filtré : dossiers assignés ou débloqués par code.</p>
              <div className="flex flex-col gap-2">
                {interns.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStaffLogin(u.id)}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-brand-gold hover:bg-brand-gold/5"
                  >
                    <Avatar user={u} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-dark">{u.name}</p>
                      <p className="truncate text-xs text-brand-gray">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="CLIENT">
              <p className="mb-3 text-xs text-brand-gray">Connexion à votre espace personnel via code client.</p>
              <form onSubmit={handleClientLogin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="codeClient">Code client</Label>
                  <Input
                    id="codeClient"
                    placeholder="Ex. CBC-101"
                    value={codeClient}
                    onChange={(e) => setCodeClient(e.target.value)}
                    className="case-code"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-xs text-rose-600">{error}</p>}
                <Button type="submit" variant="gold" className="mt-1">
                  Accéder à mon espace
                </Button>
                <p className="text-xs text-brand-gray">
                  Essayez par exemple <span className="case-code">CBC-101</span> /{" "}
                  contact@bellac-consulting.com
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
