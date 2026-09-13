"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand-dark text-white hover:bg-navy-800 shadow-luxury",
        gold: "bg-brand-gold text-brand-dark hover:bg-gold-600 hover:text-white shadow-luxury",
        outline: "border border-slate-200 bg-white text-brand-dark hover:border-brand-gold/40 hover:bg-slate-50",
        ghost: "text-brand-dark hover:bg-slate-100",
        destructive: "bg-rose-500 text-white hover:bg-rose-600",
        subtle: "bg-slate-100 text-brand-dark hover:bg-slate-200",
        link: "text-brand-dark underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
