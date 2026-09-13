"use client";

import * as React from "react";
import { Folder, FileText, Plus, History, Share2, UploadCloud, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { GED_FOLDERS } from "@/types/database";
import { formatDateTime, cn } from "@/lib/utils";

const FOLDER_LABELS: Record<string, string> = {
  "01_Pieces_Client": "01 · Pièces client",
  "02_Actes_Et_Procedure": "02 · Actes & procédure",
  "03_Correspondances": "03 · Correspondances",
  "04_Decisions_Et_Jugements": "04 · Décisions & jugements",
};

function formatBytes(bytes?: number) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function splitFileName(fileName: string): { base: string; extension: string } {
  const idx = fileName.lastIndexOf(".");
  if (idx <= 0) return { base: fileName, extension: "" };
  return { base: fileName.slice(0, idx), extension: fileName.slice(idx + 1) };
}

export function GedTree({ dossierId }: { dossierId: string }) {
  const gedFiles = useAppStore((s) => s.gedFiles).filter((f) => f.dossierId === dossierId);
  const addGedFile = useAppStore((s) => s.addGedFile);
  const addGedFileVersion = useAppStore((s) => s.addGedFileVersion);
  const toggleGedFileShared = useAppStore((s) => s.toggleGedFileShared);
  const { staffUser, isAssociate } = useAuth();

  const [open, setOpen] = React.useState(false);
  const [folder, setFolder] = React.useState(GED_FOLDERS[0]);
  const [baseName, setBaseName] = React.useState("");
  const [extension, setExtension] = React.useState("pdf");
  const [dropFolder, setDropFolder] = React.useState(GED_FOLDERS[0]);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!staffUser || !baseName.trim()) return;
    addGedFile(dossierId, folder, baseName.trim().replace(/\s+/g, "-").toLowerCase(), extension, staffUser);
    setBaseName("");
    setOpen(false);
  }

  function handleDroppedFiles(files: FileList | null) {
    if (!files || files.length === 0 || !staffUser) return;
    for (const file of Array.from(files)) {
      const { base, extension: ext } = splitFileName(file.name);
      const objectUrl = URL.createObjectURL(file);
      addGedFile(
        dossierId,
        dropFolder,
        base.replace(/\s+/g, "-").toLowerCase(),
        ext || "bin",
        staffUser,
        file.size,
        objectUrl
      );
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion électronique des documents</CardTitle>
          <CardDescription>Arborescence automatique par dossier, avec historique de versions.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5" /> Importer un document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Déposer un document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="folder">Dossier GED</Label>
                <select
                  id="folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value as typeof folder)}
                  className="h-9 rounded-md border border-slate-200 px-2 text-sm text-brand-dark"
                >
                  {GED_FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      {FOLDER_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="baseName">Nom du fichier</Label>
                  <Input id="baseName" value={baseName} onChange={(e) => setBaseName(e.target.value)} placeholder="ex. bordereau-pieces" />
                </div>
                <div className="flex w-24 flex-col gap-1.5">
                  <Label htmlFor="extension">Extension</Label>
                  <select
                    id="extension"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    className="h-9 rounded-md border border-slate-200 px-2 text-sm text-brand-dark"
                  >
                    <option value="pdf">pdf</option>
                    <option value="docx">docx</option>
                    <option value="jpg">jpg</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" variant="gold">
                  Déposer (v1)
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              handleDroppedFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-md border-2 border-dashed px-4 py-3 text-xs text-brand-gray transition-colors",
              isDraggingOver ? "border-gold-500 bg-gold-100/40" : "border-slate-200"
            )}
          >
            <UploadCloud className={cn("h-5 w-5 shrink-0", isDraggingOver ? "text-gold-600" : "text-slate-400")} />
            <span>Glissez-déposez un fichier ici pour le classer directement dans</span>
            <select
              value={dropFolder}
              onChange={(e) => setDropFolder(e.target.value as typeof dropFolder)}
              className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs text-brand-dark"
            >
              {GED_FOLDERS.map((f) => (
                <option key={f} value={f}>
                  {FOLDER_LABELS[f]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {GED_FOLDERS.map((f) => {
          const files = gedFiles.filter((file) => file.folder === f);
          return (
            <div key={f}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-dark">
                <Folder className="h-4 w-4 text-gold-600" /> {FOLDER_LABELS[f]}
              </div>
              <div className="flex flex-col gap-1.5 pl-6">
                {files.length === 0 && <p className="text-xs text-slate-400">Aucun document.</p>}
                {files.map((file) => {
                  const current = file.versions[file.versions.length - 1];
                  const size = formatBytes(current.sizeBytes);
                  return (
                    <div key={file.id} className="flex flex-col gap-1.5 rounded-md border border-slate-100 p-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm text-brand-dark">{current.fileName}</p>
                          <p className="text-[11px] text-slate-400">
                            Déposé par {current.uploadedByName} · {formatDateTime(current.uploadedAt)}
                            {size && <> · {size}</>}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {file.versions.length > 1 && (
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <History className="h-3 w-3" /> {file.versions.length} versions
                          </Badge>
                        )}
                        {current.objectUrl ? (
                          <a
                            href={current.objectUrl}
                            download={current.fileName}
                            className="flex items-center gap-1 text-xs text-brand-gray hover:text-brand-dark"
                          >
                            <Download className="h-3 w-3" /> Télécharger
                          </a>
                        ) : (
                          <span
                            className="flex cursor-not-allowed items-center gap-1 text-xs text-slate-300"
                            title="Document simulé — aucun fichier réel dans cette démo"
                          >
                            <Download className="h-3 w-3" /> Télécharger
                          </span>
                        )}
                        <button
                          onClick={() => staffUser && addGedFileVersion(file.id, staffUser)}
                          className="text-xs text-brand-gray hover:text-brand-dark"
                        >
                          + nouvelle version
                        </button>
                        {isAssociate && (
                          <label className="flex items-center gap-1.5 text-xs text-brand-gray">
                            <Share2 className="h-3 w-3" />
                            <Switch checked={file.sharedWithClient} onCheckedChange={() => toggleGedFileShared(file.id)} />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
