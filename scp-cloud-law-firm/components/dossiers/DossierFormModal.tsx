"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";

const DEFAULT_CHECKLIST = ["Pièce d'identité du client", "Procuration signée", "Pièces justificatives du dossier"];

const schema = z.object({
  titre: z.string().min(3, "Titre requis"),
  clientId: z.string().min(1, "Client requis"),
  associeReferentId: z.string().min(1, "Associé référent requis"),
  stagiairesAssignesIds: z.array(z.string()),
  isRestricted: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function DossierFormModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [checklistLabels, setChecklistLabels] = React.useState<string[]>(DEFAULT_CHECKLIST);
  const [newItem, setNewItem] = React.useState("");

  const clients = useAppStore((s) => s.clients);
  const users = useAppStore((s) => s.users);
  const addDossier = useAppStore((s) => s.addDossier);

  const associates = users.filter((u) => u.role === "ASSOCIATE");
  const interns = users.filter((u) => u.role === "INTERN");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { stagiairesAssignesIds: [], isRestricted: false },
  });

  const selectedInterns = useWatch({ control, name: "stagiairesAssignesIds" }) ?? [];

  function onSubmit(values: FormValues) {
    const dossier = addDossier({ ...values, checklistLabels });
    reset();
    setChecklistLabels(DEFAULT_CHECKLIST);
    setOpen(false);
    router.push(`/dossiers/${dossier.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          reset();
          setChecklistLabels(DEFAULT_CHECKLIST);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="gold">
          <Plus className="h-4 w-4" /> Nouveau dossier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau dossier</DialogTitle>
          <DialogDescription>La référence (DOS-CODE-ANNÉE-NUM) est générée automatiquement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titre">Titre du dossier</Label>
            <Input id="titre" placeholder="Ex. Contentieux commercial — rupture de contrat" {...register("titre")} />
            {errors.titre && <p className="text-xs text-rose-600">{errors.titre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clientId">Client</Label>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.codeClient} — {c.nomRaisonSociale}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.clientId && <p className="text-xs text-rose-600">{errors.clientId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="associeReferentId">Associé référent</Label>
              <Controller
                control={control}
                name="associeReferentId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="associeReferentId">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {associates.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.associeReferentId && <p className="text-xs text-rose-600">{errors.associeReferentId.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Stagiaires assignés</Label>
            <div className="flex flex-wrap gap-2">
              {interns.map((intern) => {
                const active = selectedInterns.includes(intern.id);
                return (
                  <button
                    type="button"
                    key={intern.id}
                    onClick={() => {
                      const next = active
                        ? selectedInterns.filter((id) => id !== intern.id)
                        : [...selectedInterns, intern.id];
                      setValue("stagiairesAssignesIds", next, { shouldValidate: true });
                    }}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      active ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-slate-200 bg-white text-brand-gray hover:border-slate-300"
                    }`}
                  >
                    {intern.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
            <div>
              <p className="text-sm text-brand-dark">Dossier sensible</p>
              <p className="text-xs text-slate-400">Affiche un badge de confidentialité renforcée.</p>
            </div>
            <Controller
              control={control}
              name="isRestricted"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Checklist paperasse</Label>
            <div className="flex flex-col gap-1">
              {checklistLabels.map((label, i) => (
                <div key={i} className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-sm text-brand-dark">
                  {label}
                  <button
                    type="button"
                    onClick={() => setChecklistLabels((items) => items.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une pièce à la checklist"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newItem.trim()) {
                      setChecklistLabels((items) => [...items, newItem.trim()]);
                      setNewItem("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newItem.trim()) {
                    setChecklistLabels((items) => [...items, newItem.trim()]);
                    setNewItem("");
                  }
                }}
              >
                Ajouter
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" variant="gold">
              Créer le dossier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
