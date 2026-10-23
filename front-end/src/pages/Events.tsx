import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Reveal } from "@/components/site/Reveal";
import { PageHeader, PlaceholderPhoto, buttonStyles, SectionTitle } from "@/components/site/ui";
import { Seo } from "@/components/site/Seo";
import { eventFallback, eventPhotos } from "@/lib/images";
import { FaRegCalendarAlt } from "react-icons/fa";
import { selectAuthors, selectCatalogStatus, selectEvents } from "@/store/catalogSelectors";

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

export function EventsPage() {
  const events = useSelector(selectEvents) as StoreEvent[];
  const status = useSelector(selectCatalogStatus);

  // Date du jour au format "AAAA-MM-JJ" (heure locale), comparable aux dates de la base
  const today = new Date().toLocaleDateString("sv-SE");

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)), // le plus proche d'abord
    [events, today],
  );

  const past = useMemo(
    () =>
      events
        .filter((e) => e.date < today)
        .sort((a, b) => b.date.localeCompare(a.date)), // le plus récent d'abord
    [events, today],
  );

  const loading = status === "idle" || status === "loading";

  return (
    <>
      <Seo
        title="Events — Là où les histoires se racontent | Hadithi Publishers"
        description="Sommets, conférences, rencontres : nos auteurs présents là où les histoires se vivent. Événements à venir et archives Hadithi Publishers."
      />

      <PageHeader
        tone="events"
        eyebrow="Events"
        title="Nos événements"
        intro=""
      />

      <section className="intro">
        <div className="container-editorial pt-20 py-10">
          <p className="text-[20px] leading-[30px] sm:text-[25px] sm:leading-[35px]">
            Nous vendons nos livres où les histoires se vivent — sommets, conférences, rencontres. Chaque événement est une occasion de dialogue direct entre l'auteur et son lecteur, en marge des lancements. C'est notre réseau institutionnel qui rend cela possible, et c'est aussi ce qui nous distingue d'un éditeur de bureau.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="container-editorial py-10 pb-25">
          <SectionTitle eyebrow="À venir" title="Prochains événements" />
          {loading ? (
            <p className="mt-8 text-lg">Chargement…</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-8 text-lg text-muted-foreground">
              Aucun événement programmé pour le moment.
            </p>
          ) : (
            <ul className="mt-8">
              {upcoming.map((e, i) => (
                <EventRow key={e.slug} event={e} index={i} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {past.length > 0 ? (
        <section className="bg-warm-grey">
          <div className="container-editorial py-24">
            <SectionTitle eyebrow="Archives" title="Événements passés" />
            <ul className="mt-8">
              {past.map((e, i) => (
                <EventRow key={e.slug} event={e} index={i} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}