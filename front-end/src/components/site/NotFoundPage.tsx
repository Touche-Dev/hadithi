import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-extrabold text-navy">404</h1>
        <h2 className="mt-4 text-xl font-extrabold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-navy px-6 py-3 text-[0.8rem] uppercase tracking-[0.14em] text-cream transition-colors hover:bg-navy-soft"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
