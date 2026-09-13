import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("fr-FR", opts ?? { day: "2-digit", month: "long", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string, from = new Date("2026-08-09T09:00:00.000Z")) {
  const diffMs = new Date(iso).getTime() - from.getTime();
  const diffH = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffH) < 1) return "à l'instant";
  if (Math.abs(diffH) < 24) return diffH > 0 ? `dans ${diffH} h` : `il y a ${Math.abs(diffH)} h`;
  const diffD = Math.round(diffH / 24);
  return diffD > 0 ? `dans ${diffD} j` : `il y a ${Math.abs(diffD)} j`;
}
