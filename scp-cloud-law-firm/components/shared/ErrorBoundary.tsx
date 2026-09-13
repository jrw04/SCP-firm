"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: React.ReactNode;
  /** Shown in the fallback card, e.g. "Fil de discussion". Defaults to a generic label. */
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Class component is required here — React only supports error boundaries
 * via getDerivedStateFromError / componentDidCatch, there is no Hooks
 * equivalent. Wrap any section that fetches/derives data from the store
 * (each chemise-virtuelle tab, each top-level page) so a failure in one
 * section never blanks the rest of the screen.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` — ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <Card className="flex flex-col items-center gap-3 border-rose-200 bg-rose-50/40 p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-dark">
              {this.props.label ? `Impossible d'afficher « ${this.props.label} »` : "Une erreur est survenue"}
            </p>
            <p className="mt-1 text-xs text-brand-gray">
              Le reste de la page reste disponible. Vous pouvez réessayer ci-dessous.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Réessayer
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
