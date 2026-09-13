"use client";

import * as React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { generateClientCode } from "@/services/codeGenerator";

const schema = z.object({
  nomRaisonSociale: z.string().min(2, "Nom ou raison sociale requis (2 caractères min.)"),
  typeClient: z.enum(["PARTICULIER", "ENTREPRISE"]),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(6, "Numéro de téléphone invalide"),
  adresse: z.string().min(3, "Adresse requise"),
});

type FormValues = z.infer<typeof schema>;

export function ClientFormModal() {
  const [open, setOpen] = React.useState(false);
  const clients = useAppStore((s) => s.clients);
  const addClient = useAppStore((s) => s.addClient);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { typeClient: "ENTREPRISE" },
  });

  const watchedName = useWatch({ control, name: "nomRaisonSociale" });
  const previewCode = watchedName && watchedName.length >= 2 ? generateClientCode(watchedName, clients) : null;

  function onSubmit(values: FormValues) {
    addClient({ ...values, piecesIdentitePaths: [] });
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="gold">
          <Plus className="h-4 w-4" /> Nouveau client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
          <DialogDescription>Le code client (trigramme + numéro) est généré automatiquement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nomRaisonSociale">Nom / Raison sociale</Label>
            <Input id="nomRaisonSociale" placeholder="Ex. Cabinet Bellac Consulting" {...register("nomRaisonSociale")} />
            {errors.nomRaisonSociale && <p className="text-xs text-rose-600">{errors.nomRaisonSociale.message}</p>}
            {previewCode && (
              <p className="text-xs text-slate-400">
                Code attribué : <span className="case-code font-medium text-brand-dark">{previewCode}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="typeClient">Type de client</Label>
            <Controller
              control={control}
              name="typeClient"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="typeClient">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTREPRISE">Entreprise</SelectItem>
                    <SelectItem value="PARTICULIER">Particulier</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="contact@exemple.com" {...register("email")} />
            {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" placeholder="+237 6 XX XX XX XX" {...register("telephone")} />
            {errors.telephone && <p className="text-xs text-rose-600">{errors.telephone.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" placeholder="Quartier, ville" {...register("adresse")} />
            {errors.adresse && <p className="text-xs text-rose-600">{errors.adresse.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" variant="gold">
              Créer le client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
