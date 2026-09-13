"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { FileDown, FileType2, Save, FileText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { useDossierAccess } from "@/hooks/useDossierAccess";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { renderTemplate } from "@/services/templateEngine";
import { exportTextAsPdf } from "@/services/pdfExport";
import { exportTextAsDocx } from "@/services/docxExport";

export default function TemplatesPage() {
  return (
    <React.Suspense fallback={null}>
      <TemplatesPageInner />
    </React.Suspense>
  );
}

function TemplatesPageInner() {
  const searchParams = useSearchParams();
  const { staffUser } = useAuth();
  const templates = useAppStore((s) => s.templates);
  const clients = useAppStore((s) => s.clients);
  const users = useAppStore((s) => s.users);
  const addGedFile = useAppStore((s) => s.addGedFile);
  const { visibleDossiers } = useDossierAccess();

  const [templateId, setTemplateId] = React.useState(templates[0]?.id ?? "");
  const [dossierId, setDossierId] = React.useState(searchParams.get("dossierId") ?? "");
  const [saved, setSaved] = React.useState(false);

  const template = templates.find((t) => t.id === templateId);
  const dossier = visibleDossiers.find((d) => d.id === dossierId);
  const client = dossier ? clients.find((c) => c.id === dossier.clientId) : undefined;
  const avocat = dossier ? users.find((u) => u.id === dossier.associeReferentId) : undefined;

  const rendered =
    template && dossier && client && avocat ? renderTemplate(template, { client, dossier, avocat }) : null;

  function fileBaseName() {
    const slug = (template?.title ?? "document")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const refSuffix = dossier?.dossierRef.split("-").slice(1).join("-") ?? "";
    return `${slug}-${refSuffix}`;
  }

  function handleSaveToGed() {
    if (!dossier || !staffUser || !template) return;
    addGedFile(dossier.id, "02_Actes_Et_Procedure", fileBaseName(), "pdf", staffUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Générateur d’actes</CardTitle>
          <CardDescription>Sélectionnez un modèle et un dossier pour générer l’acte.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template">Modèle</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {template && <p className="text-xs text-slate-400">Catégorie : {template.category}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dossier">Dossier</Label>
            <Select value={dossierId} onValueChange={setDossierId}>
              <SelectTrigger id="dossier">
                <SelectValue placeholder="Sélectionner un dossier" />
              </SelectTrigger>
              <SelectContent>
                {visibleDossiers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.dossierRef}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dossier && client && avocat && (
            <div className="rounded-md bg-slate-50 p-3 text-xs text-brand-gray">
              <p>
                <span className="text-slate-400">Client :</span> {client.nomRaisonSociale} ({client.codeClient})
              </p>
              <p>
                <span className="text-slate-400">Avocat responsable :</span> {avocat.name}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
            <Button
              variant="gold"
              disabled={!rendered}
              onClick={() => rendered && template && exportTextAsPdf(template.title, rendered, fileBaseName())}
            >
              <FileDown className="h-4 w-4" /> Exporter en PDF
            </Button>
            <Button variant="outline" disabled={!rendered} onClick={() => rendered && exportTextAsDocx(rendered, fileBaseName())}>
              <FileType2 className="h-4 w-4" /> Exporter en Word
            </Button>
            <Button variant="subtle" disabled={!rendered} onClick={handleSaveToGed}>
              <Save className="h-4 w-4" /> {saved ? "Enregistré dans la GED ✓" : "Enregistrer dans la GED"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold-600" /> Prévisualisation
          </CardTitle>
          <CardDescription>Les balises sont remplacées automatiquement par les données du dossier sélectionné.</CardDescription>
        </CardHeader>
        <CardContent>
          {rendered ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
              <div className="letterhead-rule mb-6" />
              <pre className="whitespace-pre-wrap font-display text-sm leading-relaxed text-brand-dark">{rendered}</pre>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
              Sélectionnez un modèle et un dossier pour afficher la prévisualisation.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
