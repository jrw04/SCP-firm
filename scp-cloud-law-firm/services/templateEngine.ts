import type { Client, Dossier, DocumentTemplate, User } from "@/types/database";

export interface TemplateContext {
  client: Client;
  dossier: Dossier;
  avocat: User;
  today?: Date;
}

const TAGS: Record<string, (ctx: TemplateContext) => string> = {
  "{{CLIENT_NOM}}": (ctx) => ctx.client.nomRaisonSociale,
  "{{CLIENT_CODE}}": (ctx) => ctx.client.codeClient,
  "{{DOSSIER_REF}}": (ctx) => ctx.dossier.dossierRef,
  "{{AVOCAT_RESPONSABLE}}": (ctx) => ctx.avocat.name,
  "{{DATE_DU_JOUR}}": (ctx) =>
    (ctx.today ?? new Date()).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }),
};

export function renderTemplate(template: DocumentTemplate, ctx: TemplateContext): string {
  let out = template.contentTemplate;
  for (const [tag, resolve] of Object.entries(TAGS)) {
    out = out.split(tag).join(resolve(ctx));
  }
  return out;
}

export function listUnresolvedTags(rendered: string): string[] {
  const matches = rendered.match(/{{[A-Z_]+}}/g);
  return matches ? Array.from(new Set(matches)) : [];
}
