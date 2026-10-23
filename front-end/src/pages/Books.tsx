import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Reveal } from "@/components/site/Reveal";
import { BookCard, PageHeader, SectionTitle, buttonStyles } from "@/components/site/ui";
import { Seo } from "@/components/site/Seo";
import { cn } from "@/lib/utils"; // adapte le chemin à ton fichier cn
import { selectAuthors } from "@/store/catalogSelectors";
import {
  selectBooks,
  selectCollections,
  selectCatalogStatus,
} from "@/store/catalogSelectors";
import bgNewsletter from "@/assets/bg/bg-newsletter.webp";

const TOUS = "Tous";

// Valeurs uniques d'une liste, sans les vides
const unique = (list: (string | null | undefined)[]) =>
  Array.from(new Set(list.filter(Boolean))) as string[];

function Filter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `filtre-${label.toLowerCase().replace(/\s/g, "-")}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-navy font-[600] ">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-navy/25 bg-card px-4 py-3 text-sm text-navy transition-colors hover:border-navy focus:border-navy focus:outline-none cursor-pointer"
      >
        <option value={TOUS}>{TOUS}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}


  export function BooksPage() {
    const books = useSelector(selectBooks);
    const collections = useSelector(selectCollections);
    const status = useSelector(selectCatalogStatus);

    const [collection, setCollection] = useState(TOUS);
    const [format, setFormat] = useState(TOUS);
    const [theme, setTheme] = useState(TOUS);
    const [availability, setAvailability] = useState(TOUS);

    // Les listes des filtres sont déduites des livres
    const formats = useMemo(() => unique(books.map((b) => b.format)), [books]);
    const themes = useMemo(() => unique(books.map((b) => b.theme)), [books]);
    const availabilities = useMemo(() => unique(books.map((b) => b.availability)), [books]);
    const collectionNames = useMemo(() => collections.map((c) => c.name), [collections]);

    // Pour retrouver une collection à partir de collection_id
    const collectionById = useMemo(
      () => Object.fromEntries(collections.map((c) => [c.id, c])),
      [collections],
    );

    const authors = useSelector(selectAuthors);

    const authorBySlug = useMemo(
      () => Object.fromEntries(authors.map((a) => [a.slug, a])),
      [authors],
    );

    const filtered = useMemo(
      () =>
        books.filter(
          (b) =>
            (collection === TOUS || collectionById[b.collection_id]?.name === collection) &&
            (format === TOUS || b.format === format) &&
            (theme === TOUS || b.theme === theme) &&
            (availability === TOUS || b.availability === availability),
        ),
      [books, collectionById, collection, format, theme, availability],
    );

    // ... le return reste identique

    return (
      <>
        <Seo
          title="Nos livres — Hadithi Publishers"
          description="Le catalogue Hadithi Publishers : essais, mémoires et récits qui éclairent une trajectoire singulière ou une transformation du monde."
        />

        <PageHeader
          tone="livres"
          eyebrow="HDTBooks — catalogue"
          title="Nos livres"
          intro=""
        />

        <section className="intro">
          <div className="container-editorial pt-20 py-10">
            <p className="text-[20px] leading-[30px] sm:text-[25px] sm:leading-[35px]">Chaque ouvrage publié par Hadithi répond à une exigence : éclairer une trajectoire singulière, une dynamique de transformation du monde, ou une question de leadership et de gouvernance sans jamais sacrifier la clarté à la rigueur.</p>
          </div>
        </section>

        <section>
          <div className="container-editorial grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            <Filter
              label="Collection"
              options={collectionNames}
              value={collection}
              onChange={setCollection}
            />
            <Filter label="Format" options={formats} value={format} onChange={setFormat} />
            <Filter label="Thématique" options={themes} value={theme} onChange={setTheme} />
            <Filter
              label="Disponibilité"
              options={availabilities}
              value={availability}
              onChange={setAvailability}
            />
          </div>
        </section>

        <div className="container-editorial">
          <div className="w-full border-b border-navy/10" />
        </div>

        <section className="bg-background">
          <div className="container-editorial py-20 pt-10">
            <p className="eyebrow text-muted-foreground">
              {filtered.length} titre{filtered.length > 1 ? "s" : ""}
            </p>
            {status !== "succeeded" ? (
              <p className="mt-10 text-lg">Chargement…</p>
            ) : filtered.length === 0 ? (
              <p className="mt-10 text-lg">Aucun titre ne correspond à ces filtres.</p>
            ) : (
              <div className="mt-10 grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4 items-stretch">
                {filtered.map((book, i) => {
                  const bookCollection = collectionById[book.collection_id];
                  const author = authorBySlug[book.author_slug];

                  return (
                    <Reveal key={book.slug} delay={i * 60}>
                      <article className="group h-full flex flex-col">
                        <Link
                          to={`/livres/${book.slug}`}
                          className="flex h-full flex-col rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-soft"
                          aria-label={`Découvrir ${book.title}`}
                        >
                          <div className="relative overflow-hidden rounded-sm shadow-[0_1px_2px_rgba(5,24,46,0.08)] transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                            <div className="w-full overflow-hidden">
                              <img
                                src={`https://linen-cassowary-757431.hostingersite.com${book.cover_url}`}
                                alt={book.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full aspect-[2/3] object-cover"
                              />
                            </div>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-cream/18 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[120%]"
                            />
                          </div>

                          <div className="mt-5 flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 items-start min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-sm px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.16em] transition-colors",
                                  bookCollection?.badge,
                                )}
                              >
                                {bookCollection?.name}
                              </span>

                              <p className="text-sm font-medium tabular-nums">
                                {(book.price_cents / 100).toFixed(2)} €
                              </p>
                            </div>

                            <h3 className="text-balance-tight text-lg font-extrabold leading-tight line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-sm text-muted-foreground text-black">
                              {author?.name ?? book.author_slug}
                            </p>

                            <div className="mt-auto pt-2">
                              <button className={`${buttonStyles.solid} cursor-pointer`}>
                                Découvrir
                              </button>
                            </div>
                          </div>
                        </Link>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA : Comment nous choisissons un livre 
      <section className="bg-warm-grey text-navy">
        <div className="container-editorial grid gap-10 py-24 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
          <Reveal>
            <SectionTitle title="Comment nous choisissons un livre" />
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg leading-relaxed text-navy">
              Chaque manuscrit est évalué par un comité de lecture associant universitaires et
              praticiens du terrain, sur la base d'une grille standardisée : originalité, rigueur,
              lisibilité, pertinence, potentiel de portée.
            </p>
          </Reveal>
        </div>
      </section>
    */}

        {/* CTA : Comment nous choisissons un livre */}
        <section className="py-24">
          <div className="container-editorial">
            <Reveal>
              <div
                className="relative w-full overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat px-8 py-25 text-center"
                style={{ backgroundImage: `url(${bgNewsletter})` }}
              >
                {/* Overlay sombre pour garantir la lisibilité du texte */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(180deg, rgba(5,24,46,0.80) 0%, rgba(5,24,46,0.80) 60%, rgba(5,24,46,0.90) 100%)`,
                  }}
                />

                <div className="relative z-10">
                  <h2 className="text-[45px] font-bold text-white">
                    Comment nous choisissons un livre
                  </h2>
                  <p className="mx-auto mt-4 mb-10 max-w-[80%] text-[18px] leading-[28px] text-white">
                    Chaque manuscrit est évalué par un comité de lecture associant universitaires et
                    praticiens du terrain, sur la base d'une grille standardisée : originalité, rigueur,
                    lisibilité, pertinence, potentiel de portée.
                  </p>
                  <div className="mt-6">
                    <Link to="/soumettre-un-manuscrit" className={buttonStyles.ghostOnNavy}>
                      Soumettre un manuscrit
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>


      </>
    );
  }
