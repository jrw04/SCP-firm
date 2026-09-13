import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-100 text-brand-dark",
        navy: "border-brand-dark bg-brand-dark text-white",
        gold: "border-brand-gold/40 bg-brand-gold/10 text-brand-gold",
        success: "border-emerald-500/30 bg-emerald-50 text-emerald-600",
        danger: "border-rose-500/30 bg-rose-50 text-rose-600",
        outline: "border-slate-200 bg-white text-brand-gray",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
