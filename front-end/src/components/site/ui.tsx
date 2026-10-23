import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { collections, getAuthor, type Book, type CollectionId } from "@/lib/content";
import { bannerPhotos } from "@/lib/images";
import logoNavy from "@/assets/logo-navy.png";
import logoWhite from "@/assets/logo/logo-white.png";
import logo from "@/assets/logo/logo.png";

/* ---------------- Logo ---------------- */

export function Logo({
  variant = "navy",
  className,
}: {
  variant?: "navy" | "white";
  className?: string;
}) {
  return (
    <img
      src={variant === "white" ? logoWhite : logo}
      alt="Hadithi Publishers"
      className={cn("h-full w-auto object-contain object-left", className)}
      loading="eager"
      decoding="async"
    />
  );
}

/* ---------------- Boutons ---------------- */

const base =
  "items-center justify-center gap-2 rounded-sm px-7 py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.14em] transition-all duration-250 ease-out focus-visible:outline-2 focus-visible:outline-offset-3 active:scale-[0.975] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export const buttonStyles = {
  /* Primaire sur fond clair : Bleu Clair plein, texte Midnight Navy */
  solid: cn(
    base,
    "bg-navy text-white shadow-[0_1px_2px_rgba(5,24,46,0.15)] text-[13px] cursor-pointer",
  ),
  /* Secondaire sur fond clair : contour navy, fond transparent */
  outline: cn(
    base,
    "border border-navy/40 bg-transparent text-navy hover:border-cream hover:bg-navy hover:text-cream focus-visible:outline-navy cursor-pointer",
  ),
  /* Primaire sur fond navy : aplat crème, texte navy */
  onNavy: cn(
    base,
    "bg-cream text-navy shadow-[0_1px_2px_rgba(0,0,0,0.25)] hover:bg-transparent hover:text-cream hover:border hover:border-cream/45 hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.8)] focus-visible:outline-light-blue cursor-pointer",
  ),
  /* Secondaire sur fond navy : contour crème, fond transparent */
  ghostOnNavy: cn(
    base,
    "border border-cream/45 bg-transparent text-cream hover:border-cream hover:bg-cream hover:text-navy focus-visible:outline-cream cursor-pointer",
  ),
};

/* ---------------- Badge collection ---------------- */

export function CollectionBadge({
  collection,
  className,
}: {
  collection: CollectionId;
  className?: string;
}) {
  const c = collections[collection];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.16em] transition-colors",
        c.badge,
        className,
      )}
    >
      {c.name}
    </span>
  );
}

export function DemoTag({ label = "exemple" }: { label?: string }) {
  return (
    <span className="eyebrow rounded-sm border border-navy/15 px-2 py-0.5 text-[0.5625rem] text-muted-foreground">
      {label}
    </span>
  );
}

/* ---------------- Photo placeholder ---------------- */

export function PlaceholderPhoto({
  src,
  alt,
  className,
  imgClassName,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <div className={cn("relative overflow-hidden bg-navy", className)}>
      <img
        src={src}
        alt={alt}
        data-placeholder="true"
        loading={loading}
        decoding="async"
        className={cn(
          "h-full w-full object-cover",
          imgClassName,
        )}
      />
      
    </div>
  );
}

/* ---------------- Couverture placeholder ---------------- */

const tones: Record<Book["coverTone"], string> = {
  navy: "bg-navy text-cream",
  warm: "bg-warm-grey text-navy",
  blue: "bg-light-blue text-navy",
  cream: "bg-[color:var(--card)] text-navy",
};

export function BookCover({ book, className }: { book: Book; className?: string }) {
  return (
    <div className="w-full overflow-hidden">
      <img
        src={book.coverSrc}
        data-placeholder="true"
        loading="eager"
        decoding="async"
        className="w-full h-full aspect-[2/3] object-cover"
      />
    </div>
  );
}

/* ---------------- Carte livre ---------------- */

export function BookCard({ book }: { book: Book }) {
  const author = getAuthor(book.authorSlug)?.name ?? "Auteur à confirmer";
  return (
    <article className="group h-full flex flex-col">
      <Link
        to={`/livres/${book.slug}`}
        className="flex h-full flex-col rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-soft"
        aria-label={`Découvrir ${book.title}`}
      >
        <div className="relative overflow-hidden rounded-sm shadow-[0_1px_2px_rgba(5,24,46,0.08)] transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
          <BookCover
            book={book}
            className="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-cream/18 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[120%]"
          />
        </div>
        <div className="mt-5 flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 items-start min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between">
            <CollectionBadge
              collection={book.collection}
              className="w-fit opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            /><p className="text-sm font-medium tabular-nums">{book.price}</p>
          </div>
          <h3 className="text-balance-tight text-lg font-extrabold leading-tight line-clamp-2">{book.title}</h3>
          <p className="text-sm text-muted-foreground">{author}</p>

          <div className="mt-auto pt-2">
            <button className={`${buttonStyles.solid} cursor-pointer`}>
              Découvrir
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ---------------- En-tête de page (bannières de marque) ---------------- */

export type BannerTone = "livres" | "auteurs" | "events" | "manuscrit" | "apropos";

/** Dégradé de marque appliqué EN OVERLAY au-dessus de la photo de bannière. */
const bannerGradients: Record<BannerTone, string> = {
  livres:
    "linear-gradient(to top, color-mix(in oklab, var(--navy) 92%, transparent) 0%, color-mix(in oklab, var(--navy) 70%, transparent) 45%, color-mix(in oklab, var(--navy) 28%, transparent) 100%)",
  auteurs:
    "linear-gradient(to top, color-mix(in oklab, var(--navy) 92%, transparent) 0%, color-mix(in oklab, var(--navy) 70%, transparent) 45%, color-mix(in oklab, var(--navy) 28%, transparent) 100%)",
  events:
    "linear-gradient(to top, color-mix(in oklab, var(--navy) 92%, transparent) 0%, color-mix(in oklab, var(--navy) 70%, transparent) 45%, color-mix(in oklab, var(--navy) 28%, transparent) 100%)",
  manuscrit:
    "linear-gradient(to top, color-mix(in oklab, var(--navy) 92%, transparent) 0%, color-mix(in oklab, var(--navy) 70%, transparent) 45%, color-mix(in oklab, var(--navy) 28%, transparent) 100%)",
  apropos:
    "linear-gradient(to top, color-mix(in oklab, var(--navy) 92%, transparent) 0%, color-mix(in oklab, var(--navy) 70%, transparent) 45%, color-mix(in oklab, var(--navy) 28%, transparent) 100%)",
};

export function PageHeader({
  eyebrow,
  title,
  intro,
  tone = "livres",
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  tone?: BannerTone;
  children?: ReactNode;
}) {
  const photo = bannerPhotos[tone];
  return (
    <header className="grain relative isolate overflow-hidden bg-navy text-cream">
      {/* photo d'ambiance temporaire */}
      <img
        src={photo.src}
        alt={photo.alt}
        data-placeholder="true"
        loading="eager"
        decoding="async"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover [filter:saturate(0.7)_contrast(1.02)] motion-safe:animate-[hero-zoom_22s_ease-out_forwards]"
      />
      {/* dégradé de marque en overlay */}
      <span
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{ backgroundImage: bannerGradients[tone] }}
      />
      {/* voile d'unification + vignette : garantit la lisibilité du texte clair */}
      <span className="pointer-events-none absolute inset-0 bg-navy/35" aria-hidden="true" />
      <span
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, transparent 40%, color-mix(in oklab, var(--navy) 70%, transparent) 100%)",
        }}
      />

      <div className="container-editorial relative py-20 md:py-40">
        {eyebrow ? (
          <p className="eyebrow mb-6 flex items-center gap-3 text-light-blue">
            <span aria-hidden="true" className="h-px w-8 bg-light-blue/60" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance-tight max-w-4xl sm:text-[70px] text-[50px] text-cream">
          {title}
        </h1>
        {intro ? (
          <p className="mt-6 max-w-4xl text-base leading-relaxed text-cream/85 md:text-lg">
            {intro}
          </p>
        ) : null}
        {children}
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-light-blue/40 to-transparent"
      />
    </header>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-4xl", className)}>
      {eyebrow ? <p className="eyebrow mb-4 text-muted-foreground">{eyebrow}</p> : null}
      <h2 className="text-[clamp(1.9rem,4vw,3rem)]">{title}</h2>
    </div>
  );
}
