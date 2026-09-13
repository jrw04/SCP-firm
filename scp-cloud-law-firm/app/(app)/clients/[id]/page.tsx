"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, MapPin, FileStack, Building2, User as UserIcon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DossierStatusBadge, PaperasseBadge } from "@/components/shared/DossierStatusBadge";
import { formatDate } from "@/lib/utils";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clients = useAppStore((s) => s.clients);
  const dossiers = useAppStore((s) => s.dossiers);
  const users = useAppStore((s) => s.users);

  const client = clients.find((c) => c.id === params.id);
  if (!client) notFound();

  const linkedDossiers = dossiers.filter((d) => d.clientId === client.id);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <p className="case-code text-xs font-medium text-gold-600">{client.codeClient}</p>
            <CardTitle className="mt-1 text-xl">{client.nomRaisonSociale}</CardTitle>
            <p className="mt-1 text-xs text-slate-400">Client depuis le {formatDate(client.createdAt)}</p>
          </div>
          <Badge variant="outline" className="gap-1">
            {client.typeClient === "ENTREPRISE" ? <Building2 className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
            {client.typeClient === "ENTREPRISE" ? "Entreprise" : "Particulier"}
          </Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" /> {client.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" /> {client.telephone}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" /> {client.adresse}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <FileStack className="h-4 w-4 text-slate-400" />
          <h2 className="font-display text-lg text-brand-dark">Dossiers liés ({linkedDossiers.length})</h2>
        </div>
        <div className="flex flex-col gap-2">
          {linkedDossiers.map((d) => {
            const associe = users.find((u) => u.id === d.associeReferentId);
            return (
              <Link key={d.id} href={`/dossiers/${d.id}`}>
                <Card className="flex flex-col gap-2 p-4 transition-colors hover:border-gold-500 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="case-code text-xs text-slate-400">{d.dossierRef}</p>
                    <p className="text-sm font-medium text-brand-dark">{d.titre}</p>
                    <p className="text-xs text-slate-400">Réf. {associe?.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PaperasseBadge complete={d.paperasseComplete} />
                    <DossierStatusBadge status={d.status} />
                  </div>
                </Card>
              </Link>
            );
          })}
          {linkedDossiers.length === 0 && (
            <Card className="p-6 text-center text-sm text-slate-400">Aucun dossier pour ce client pour le moment.</Card>
          )}
        </div>
      </div>
    </div>
  );
}
