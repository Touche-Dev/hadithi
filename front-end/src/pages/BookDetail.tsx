import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DemoTag, PageHeader, PlaceholderPhoto, buttonStyles, SectionTitle } from "@/components/site/ui";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/components/site/Seo";
import { NotFoundPage } from "@/components/site/NotFoundPage";
import { cn } from "@/lib/utils";
import { eventFallback, eventPhotos } from "@/lib/images";
import { FaRegCalendarAlt } from "react-icons/fa";

import {
  selectAuthors,
  selectAuthorBySlug,
  selectBookBySlug,
  selectBooks,
  selectCatalogStatus,
  selectCollections,
  selectEvents,
} from "@/store/catalogSelectors";

const BACK_URL = "http://localhost:3001"; // pour les PDF servis par le back



const formatDate = (date?: string | null) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

type StoreEvent = {
  slug: string;
  title: string;
  date: string;
  city: string;
  type: string;
  author_slugs: string[];
  img_url?: string | null;
};

function EventRow({ event, index }: { event: StoreEvent; index: number }) {
  const authors = useSelector(selectAuthors);

  const auteurs = event.author_slugs
    .map((s) => authors.find((a) => a.slug === s)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <Reveal as="li" delay={index * 80}>
      <Link
        to={`/events/${event.slug}`}
        className="hairline-top group grid gap-8 rounded-sm px-2 py-8 lg:transition-[background-color,padding] duration-500 ease-out lg:hover:bg-[color:color-mix(in_oklab,var(--navy)_4%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-soft lg:grid-cols-[12rem_minmax(0,1fr)_auto] lg:items-center"
      >
        <PlaceholderPhoto
          className="aspect-[16/10] w-full rounded-sm"
          imgClassName=""
          src={event.img_url || eventFallback.src}
          alt={event.title}
        />
        <span className="min-w-0">
          <span className="eyebrow rounded-sm border border-navy/15 px-2 py-0.5 text-[0.5625rem] text-muted-foreground bg-warm-grey block mb-2 w-fit">
            {event.city}
          </span>
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-display text-2xl font-extrabold">{event.title}</span>
          </span>
          <span className="mt-2 block text-sm text-muted-foreground">
            {event.city} · {event.type}
            {auteurs ? ` · ${auteurs}` : ""}
          </span>
          <span className="eyebrow mt-1.5 flex gap-2 text-muted-foreground">
            <FaRegCalendarAlt className="text-[16px]" />
            {formatDate(event.date)}
          </span>
        </span>

        <div>
          <button className={`${buttonStyles.outline}`}>En savoir plus</button>
        </div>
      </Link>
    </Reveal>
  );
}

export function BookDetailPage() {
  const { slug = "" } = useParams();

  // Tous les hooks AVANT les return conditionnels
  const status = useSelector(selectCatalogStatus);
  const book = useSelector(selectBookBySlug(slug));
  const author = useSelector(selectAuthorBySlug(book?.author_slug));
  const authors = useSelector(selectAuthors);
  const collections = useSelector(selectCollections);
  const books = useSelector(selectBooks);
  const events = useSelector(selectEvents);

  const collection = collections.find((c) => c.id === book?.collection_id);

  const linkedEvents = useMemo(
    () => events.filter((e) => e.book_slugs.includes(slug)),
    [events, slug],
  );



  const related = useMemo(() => {
    if (!book) return [];

    const others = books.filter((b) => b.slug !== slug);
    const sameCollection = others.filter((b) => b.collection_id === book.collection_id);
    const rest = others.filter((b) => b.collection_id !== book.collection_id);

    // Même collection d'abord, puis on complète jusqu'à 4
    return [...sameCollection, ...rest].slice(0, 4);
  }, [books, book, slug]);

  // Accès direct à l'URL : on attend le chargement avant de conclure "introuvable"
  if (status === "idle" || status === "loading") {
    return (
      <section className="container-editorial py-32">
        <p className="text-lg">Chargement…</p>
      </section>
    );
  }

  const formatPrice = (price: number | string) => `${price} $`;

  if (!book) {
    return (
      <>
        <Seo title="Livre introuvable — Hadithi Publishers" noindex />
        <NotFoundPage />
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${book.title} — Hadithi Publishers`}
        description={`${book.title}${collection ? `, collection ${collection.name}. ${collection.tagline}` : ""}`}
      />

      <section className="bg-navy text-cream">
        <div className="container-editorial grid gap-14 py-20 md:py-24 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
          <div>
            <img
              src={`https://linen-cassowary-757431.hostingersite.com${book.cover_url}`}
              alt={book.title}
              className="aspect-[2/3] w-full rounded-sm object-cover shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
            />

            {book.excerpt_pdf_url ? (
              <a
                href={`https://linen-cassowary-757431.hostingersite.com${book.excerpt_pdf_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonStyles.ghostOnNavy} mt-6 block w-full text-center`}
              >
                Lire un extrait
              </a>
            ) : null}
          </div>

          <div>
            {collection ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-sm px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.16em]",
                  collection.badge,
                )}
              >
                {collection.name}
              </span>
            ) : null}

            <h1 className="mt-6 text-[30px]">{book.title}</h1>

            {author ? (
              <p className="mt-5 text-[18px] text-cream/80">
                <Link to={`/auteurs/${author.slug}`}>{author.name}</Link>
                {" — "}
                {author.role}
              </p>
            ) : null}

            <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-cream/15 pt-8 sm:grid-cols-2">
              {[
                ["Format & Pagination", book.pages],
                ["Prix public", formatPrice(book.price_cents)],
                ["Parution", book.published_at ? formatDate(book.published_at) : "À paraître"],
                ["ISBN", book.isbn],
                ["Disponibilité", book.availability],
                ["Thématique", book.theme],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow text-light-blue">{k}</dt>
                  <dd className="mt-1 text-sm text-cream/85">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <button type="button" className={buttonStyles.onNavy}>
                Acheter sur notre site
              </button>
              <button type="button" className={buttonStyles.ghostOnNavy}>
                Trouver en librairie
              </button>
              <button type="button" className={buttonStyles.ghostOnNavy}>
                Version numérique
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container-editorial max-w-4xl space-y-16 py-24">
          <Reveal>
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)]">L'histoire</h2>
            <p className="mt-5 leading-relaxed text-black">{book.history}</p>
          </Reveal>
          <Reveal>
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)]">Pourquoi ce livre compte</h2>
            <p className="mt-5 leading-relaxed text-black">{book.why}</p>
          </Reveal>

          {author ? (
            <Reveal>
              <h2 className="text-[clamp(1.6rem,3vw,2.25rem)]">L'auteur</h2>
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="h-30 w-30 shrink-0">
                  <PlaceholderPhoto
                    className="h-full w-full rounded-sm shadow-[0_1px_2px_rgba(5,24,46,0.08)]"
                    imgClassName=""
                    src={author.img_url}
                    alt={author.name}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg">{author.name}</h3>
                  <p className="text-sm text-muted-foreground">{author.role}</p>
                  <p className="mt-4 leading-relaxed text-black">{author.bio}</p>
                  <div className="mt-6">
                    <Link to={`/auteurs/${author.slug}`} className={`${buttonStyles.outline}`}>
                      Voir la fiche complète
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : null}

          <Reveal>
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)]">Ils en parlent</h2>
            <div className="mt-5 rounded-sm border border-navy/10 bg-warm-grey p-8">
              <p className="editorial-quote text-xl text-navy/70">
                Les premières recensions arriveront prochainement.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {linkedEvents.length ? (
        <section>
          <div className="container-editorial py-20">
            <SectionTitle eyebrow="Rencontres" title="Événements à venir" />
            <ul className="mt-8">
              {linkedEvents.map((e, i) => (
                <EventRow key={e.slug} event={e} index={i} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="bg-background">
          <div className="container-editorial py-24">
            <SectionTitle eyebrow="Même collection" title="Vous aimerez aussi" />
            <div className="mt-14 grid grid-cols-2 items-stretch gap-8 md:grid-cols-3 lg:grid-cols-4">
              {related.map((b, i) => {
                const bCollection = collections.find((c) => c.id === b.collection_id);
                const bAuthor = authors.find((a) => a.slug === b.author_slug);

                return (
                  <Reveal key={b.slug} delay={i * 60}>
                    <article className="group flex h-full flex-col">
                      <Link
                        to={`/livres/${b.slug}`}
                        className="flex h-full flex-col rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-soft"
                        aria-label={`Découvrir ${b.title}`}
                      >
                        <div className="relative overflow-hidden rounded-sm shadow-[0_1px_2px_rgba(5,24,46,0.08)]">
                          <img
                            src={b.cover_url}
                            alt={b.title}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[2/3] h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-5 flex flex-1 flex-col gap-2">
                          <div className="flex flex-col items-start gap-4 min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-sm px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.16em]",
                                bCollection?.badge,
                              )}
                            >
                              {bCollection?.name}
                            </span>
                            <p className="text-sm font-medium tabular-nums">
                              {formatPrice(b.price_cents)}
                            </p>
                          </div>
                          <h3 className="text-balance-tight line-clamp-2 text-lg font-extrabold leading-tight">
                            {b.title}
                          </h3>
                          <p className="text-sm text-muted-foreground text-black">
                            {bAuthor?.name ?? b.author_slug}
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
          </div>
        </section>
      ) : null}
    </>
  );
}