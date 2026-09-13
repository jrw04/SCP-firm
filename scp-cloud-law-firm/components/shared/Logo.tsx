"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "icon" = feather + scales only (compact navbar use). "full" = includes the wordmark + baseline. */
  variant?: "icon" | "full";
  height?: number;
  className?: string;
  /** Renders the "SCP CLOUD LAW FIRM" text lockup next to the icon (icon variant only). */
  withWordmark?: boolean;
  /** Use light text for the CSS wordmark/fallback when placed on a dark surface. The PNG artwork itself is unaffected. */
  tone?: "light" | "dark";
}

const SRC = {
  icon: "/logo-icon.png",
  full: "/logo-transparent.png",
};

const ASPECT = {
  icon: 811 / 489,
  full: 873 / 751,
};

export function Logo({ variant = "icon", height = 36, className, withWordmark = false, tone = "dark" }: LogoProps) {
  const [errored, setErrored] = React.useState(false);
  const width = Math.round(height * ASPECT[variant]);
  const textColor = tone === "dark" ? "text-brand-dark" : "text-white";

  if (errored) {
    // Fallback text lockup if /logo-*.png can't be loaded, per brand guidelines.
    return (
      <span className={cn("font-display font-semibold tracking-wide", textColor, className)} style={{ fontSize: height * 0.4 }}>
        <span className="text-brand-gold">SCP</span> CLOUD LAW FIRM
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={SRC[variant]}
        alt="SCP Cloud Law Firm"
        width={width}
        height={height}
        priority
        onError={() => setErrored(true)}
        style={{ height, width: "auto" }}
      />
      {withWordmark && (
        <span className="leading-tight">
          <span className={cn("block font-display text-sm font-semibold tracking-wide", textColor)}>SCP Cloud Law Firm</span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-gold">Avocats · Cameroun &amp; Paris</span>
        </span>
      )}
    </span>
  );
}
