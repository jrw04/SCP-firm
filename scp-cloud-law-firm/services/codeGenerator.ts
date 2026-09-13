import type { Client } from "@/types/database";

/**
 * Builds the next client code from a raison sociale / name, e.g.
 * "Cabinet Bellac Consulting" -> "CBC", then finds the next free
 * sequence number starting at 101 (matching the brief's CBC-101 example).
 */
export function generateClientCode(nomRaisonSociale: string, existing: Client[]): string {
  const trigram = deriveTrigram(nomRaisonSociale);
  const usedNumbers = existing
    .filter((c) => c.codeClient.startsWith(`${trigram}-`))
    .map((c) => parseInt(c.codeClient.split("-")[1], 10))
    .filter((n) => !Number.isNaN(n));

  const allNumbers = existing
    .map((c) => parseInt(c.codeClient.split("-")[1], 10))
    .filter((n) => !Number.isNaN(n));

  const base = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : (allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 101);

  return `${trigram}-${base}`;
}

function deriveTrigram(name: string): string {
  const words = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "CLI";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();

  // Prefer initials of significant words (skip short connectors like "de", "et", "des")
  const connectors = new Set(["de", "des", "du", "et", "la", "le", "les", "sarl", "sa"]);
  const significant = words.filter((w) => !connectors.has(w.toLowerCase()));
  const pool = significant.length >= 2 ? significant : words;
  const initials = pool
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");

  return initials.length === 3 ? initials : (initials + pool[0].slice(1, 4 - initials.length).toUpperCase()).slice(0, 3);
}

export function nextDossierRef(clientCode: string, year: number, existingRefs: string[]): string {
  const prefix = `DOS-${clientCode.replace("-", "")}-${year}-`;
  const used = existingRefs
    .filter((r) => r.startsWith(prefix))
    .map((r) => parseInt(r.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = used.length > 0 ? Math.max(...used) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

/** Short, human-typeable access code for the intern-unlock module. */
export function generateAccessCode(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I ambiguity
  const block = (len: number) =>
    Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${block(4)}-${block(4)}`;
}

export type AccessCodeDuration = "12H" | "24H" | "48H" | "7D" | "CUSTOM";

export function expiryFromDuration(duration: AccessCodeDuration, from: Date, customDate?: Date): Date {
  const d = new Date(from);
  switch (duration) {
    case "12H":
      d.setHours(d.getHours() + 12);
      return d;
    case "24H":
      d.setHours(d.getHours() + 24);
      return d;
    case "48H":
      d.setHours(d.getHours() + 48);
      return d;
    case "7D":
      d.setDate(d.getDate() + 7);
      return d;
    case "CUSTOM":
      return customDate ?? d;
  }
}
