import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { PlaceholderPhoto, SectionTitle, buttonStyles } from "@/components/site/ui";
import { Seo } from "@/components/site/Seo";
import { NotFoundPage } from "@/components/site/NotFoundPage";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { contact } from "@/lib/content"; // infos de contact statiques, pas dans l'API
import { authorFallback, eventFallback, eventPhotos } from "@/lib/images";
import { FaLinkedin, FaFacebookSquare, FaInstagram, FaRegCalendarAlt } from "react-icons/fa";
import { FaXTwitter, FaLink } from "react-icons/fa6";
import {
  selectAuthorBySlug,
  selectAuthors,
  selectBooks,
  selectCatalogStatus,
  selectCollections,
  selectEvents,
} from "@/store/catalogSelectors";

const formatPrice = (price: number | string) => `${price} $`;

const formatDate = (date?: string | null) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

type AuthorLink = { label: string; href: string };

// "links" peut arriver en chaîne JSON ou en tableau
const parseLinks = (links: unknown): AuthorLink[] => {
  if (Array.isArray(links)) return links as AuthorLink[];
  if (typeof links === "string") {
    try {
      const parsed = JSON.parse(links);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const iconForLink = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("linkedin")) return <FaLinkedin />;
  if (l.includes("instagram")) return <FaInstagram />;
  if (l.includes("facebook")) return <FaFacebookSquare />;
  if (l.includes("twitter") || l === "x") return <FaXTwitter />;
  return <FaLink />;
};

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

export function AuthorDetailPage() {
  const { slug = "" } = useParams();

  // Tous les hooks avant les return conditionnels
  const status = useSelector(selectCatalogStatus);
  const author = useSelector(selectAuthorBySlug(slug));
  const authors = useSelector(selectAuthors);
  const books = useSelector(selectBooks);
  const collections = useSelector(selectCollections);
  const events = useSelector(selectEvents);

  const livres = useMemo(() => books.filter((b) => b.author_slug === slug), [books, slug]);
  const rencontres = useMemo(
    () => events.filter((e) => e.author_slugs.includes(slug)),
    [events, slug],
  );
  const links = useMemo(() => parseLinks(author?.links), [author]);

  if (status === "idle" || status === "loading") {
    return (
      <section className="container-editorial py-32">
        <p className="text-lg">Chargement…</p>
      </section>
    );
  }

  if (!author) {
    return (
      <>
        <Seo title="Auteur introuvable — Hadithi Publishers" noindex />
        <NotFoundPage />
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${author.name} — Hadithi Publishers`}
        description={`${author.name}, ${author.role}. Fiche auteur Hadithi Publishers.`}
      />

      <section className="bg-navy text-cream">
        <div className="container-editorial grid gap-12 py-20 md:py-24 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)]">
          <PlaceholderPhoto
            className="aspect-[3/4] w-full rounded-sm ring-1 ring-cream/15"
            loading="eager"
            src={author.img_url || authorFallback.src}
            alt={author.name}
          />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow text-light-blue">Auteur</p>
            </div>
            <h1 className="mt-6 text-[30px]">{author.name}</h1>
            <p className="mt-4 text-lg text-cream/80">{author.role}</p>
            <p className="mt-8 max-w-2xl leading-relaxed text-white">{author.bio}</p>

            {links.length ? (
              <p className="mt-8 flex gap-3 text-sm text-cream/80">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={l.label}
                    className="text-[22px]"
                  >
                    {iconForLink(l.label)}
                  </a>
                ))}
              </p>
            ) : null}

            <p className="mt-3 text-[16px] text-cream/80">
              Contact presse :{" "}
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container-editorial space-y-20 py-24 pt-30">
          <div>
            <SectionTitle eyebrow="Bibliographie" title="Ouvrages publiés chez Hadithi" />
            {livres.length ? (
              <div className="mt-10 grid grid-cols-2 items-stretch gap-10 md:grid-cols-4">
                {livres.map((b, i) => {
                  const bCollection = collections.find((c) => c.id === b.collection_id);

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
                            <p className="text-sm text-muted-foreground text-black">{author.name}</p>
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
            ) : (
              <p className="mt-6 text-muted-foreground">Aucun ouvrage référencé pour l'instant.</p>
            )}
          </div>

          <div className="pt-10">
            <SectionTitle eyebrow="Dans les médias" title="Interviews, presse et rencontres" />

            {rencontres.length ? (
              <ul className="mt-8">
                {rencontres.map((e, i) => (
                  <EventRow key={e.slug} event={e} index={i} />
                ))}
              </ul>
            ) : null}

            <div className="mt-8 rounded-sm border border-navy/10 bg-warm-grey p-8">
              <p className="editorial-quote text-xl text-navy/70">
                Zone modulaire — interviews et articles de presse à ajouter.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}