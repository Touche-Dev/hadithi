import { Component, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Client-side equivalent of TanStack Start's root `errorComponent`. There is
 * no server render to fall back to anymore, so a caught error just offers a
 * reload instead of `router.invalidate()`.
 */
export class RootErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error) {
    console.error(error);
    reportLovableError(error, { boundary: "root_error_boundary" });
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-extrabold">Cette page ne s'est pas chargée</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vous pouvez réessayer ou revenir à l'accueil.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-sm bg-navy px-6 py-3 text-[0.8rem] uppercase tracking-[0.14em] text-cream transition-colors hover:bg-navy-soft"
            >
              Réessayer
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-sm border border-navy/30 px-6 py-3 text-[0.8rem] uppercase tracking-[0.14em] text-navy transition-colors hover:bg-navy hover:text-cream"
            >
              Accueil
            </a>
          </div>
        </div>
      </div>
    );
  }
}
