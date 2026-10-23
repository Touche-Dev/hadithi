import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { buttonStyles } from "@/components/site/ui";
import { Seo } from "@/components/site/Seo";
import { NotFoundPage } from "@/components/site/NotFoundPage";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { eventFallback, eventPhotos } from "@/lib/images";
import {
  selectAuthors,
  selectBooks,
  selectCatalogStatus,
  selectCollections,
  selectEvents,
} from "@/store/catalogSelectors";

type StoreEvent = {
  slug: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  type: string;
  description: string;
  practical: string;
  author_slugs: string[];
  book_slugs: string[];
  img_url?: string | null;
};

const formatPrice = (price: number | string) => `${price} $`;

const formatDate = (date?: string | null) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

export function EventDetailPage() {
  const { slug = "" } = useParams();

  // Tous les hooks avant les return conditionnels
  const status = useSelector(selectCatalogStatus);
  const events = useSelector(selectEvents) as StoreEvent[];
  const authors = useSelector(selectAuthors);
  const books = useSelector(selectBooks);
  const collections = useSelector(selectCollections);

  const event = events.find((e) => e.slug === slug);

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    message: "",
    consent: false,
  });

  const handleChange =
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
      };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (status === "idle" || status === "loading") {
    return (
      <section className="container-editorial py-32">
        <p className="text-lg">Chargement…</p>
      </section>
    );
  }

  if (!event) {
    return (
      <>
        <Seo title="Événement introuvable — Hadithi Publishers" noindex />
        <NotFoundPage />
      </>
    );
  }

  const today = new Date().toLocaleDateString("sv-SE");
  const isPast = event.date < today;
  const dateLabel = formatDate(event.date);

  const auteurs = event.author_slugs
    .map((s) => authors.find((a) => a.slug === s))
    .filter(Boolean);
  const livres = event.book_slugs
    .map((s) => books.find((b) => b.slug === s))
    .filter(Boolean);

  return (
    <>
      <Seo
        title={`${event.title} — ${event.city} | Hadithi Publishers`}
        description={`${event.type} le ${dateLabel} à ${event.city}. Rencontre Hadithi Publishers.`}
      />

      <section className="relative isolate overflow-hidden bg-navy text-cream">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&fm=webp&q=70&w=1920&sat=-40&h=700"
          alt={(eventPhotos[event.slug] ?? eventFallback).alt}
          data-placeholder="true"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover [filter:saturate(0.65)]"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--navy) 92%, transparent) 0%, color-mix(in oklab, var(--navy) 72%, transparent) 100%)",
          }}
        />
        <div className="container-editorial relative py-20 md:py-24">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow text-light-blue">{event.type}</p>
          </div>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.2rem,5.5vw,4.25rem)]">Événement</h1>
          <p className="mt-6 text-lg text-cream/80 m-0">
            {dateLabel} · {event.city} · {event.venue}
          </p>
          <div className="">
            {!isPast ? (
              <button type="button" onClick={() => setIsOpen(true)} className={`${buttonStyles.onNavy} mt-10`}>
                S'inscrire
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="container-editorial">
          <div className="mb-7">
            <h2 className="text-[30px]">{event.title}</h2>
          </div>
          <img
            src={event.img_url || eventFallback.src}
            alt={event.title}
            loading="eager"
            decoding="async"
            className="inset-0 h-100 w-full object-cover [filter:saturate(0.65)]"
          />
        </div>
      </section>

      <section className="bg-background">
        <div className="container-editorial grid gap-16 pt-10 py-24 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
          <div className="space-y-12">
            <div>
              <p className="leading-relaxed text-black">{event.description}</p>
            </div>

            {auteurs.length ? (
              <div>
                <h2 className="text-[30px]">Auteurs présents</h2>
                <ul className="mt-6 space-y-3 list-disc pl-5">
                  {auteurs.map((a) => (
                    <li key={a!.slug}>
                      <Link to={`/auteurs/${a!.slug}`} className="link-underline text-lg">
                        {a!.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {livres.length ? (
              <div>
                <h2 className="text-[30px]">Livres présentés</h2>
                <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
                  {livres.map((b, i) => {
                    const bCollection = collections.find((c) => c.id === b!.collection_id);
                    const bAuthor = authors.find((a) => a.slug === b!.author_slug);

                    return (
                      <Reveal key={b!.slug} delay={i * 60}>
                        <article className="group flex h-full flex-col">
                          <Link
                            to={`/livres/${b!.slug}`}
                            className="flex h-full flex-col rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-soft"
                            aria-label={`Découvrir ${b!.title}`}
                          >
                            <div className="relative overflow-hidden rounded-sm shadow-[0_1px_2px_rgba(5,24,46,0.08)]">
                              <img
                                src={b!.cover_url}
                                alt={b!.title}
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
                                  {formatPrice(b!.price_cents)}
                                </p>
                              </div>
                              <h3 className="text-balance-tight line-clamp-2 text-lg font-extrabold leading-tight">
                                {b!.title}
                              </h3>
                              <p className="text-sm text-muted-foreground text-black">
                                {bAuthor?.name ?? b!.author_slug}
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
            ) : null}
          </div>

          <aside className="h-fit border border-navy/20 p-8">
            <h2 className="text-xl">Informations pratiques</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-black">{event.practical}</p>
            <div className="mt-8">
              <Link to="/events" className={`${buttonStyles.outline} w-full`}>
                Tous les événements
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-editorial">
          <div>
            <h2 className="text-[30px]">
              {isPast ? "Compte-rendu et galerie" : "Galerie photo"}
            </h2>
            <div className="mt-6 rounded-sm border border-navy/10 bg-warm-grey p-8">
              <p className="editorial-quote text-xl text-navy/70">
                {isPast
                  ? "Le compte-rendu et les photos seront publiés ici."
                  : "La galerie photo sera publiée après l'événement."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal d'inscription événement */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 xl:px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-[100%] max-h-[90vh] overflow-y-auto xl:max-w-[60%] bg-cream p-7 md:p-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
              className="absolute right-6 top-6 text-neutral-400 transition-colors hover:text-neutral-700"
            >
              <X size={20} />
            </button>

            <h3 className="pr-8 text-[22px] font-semibold leading-snug font-heading-ariata text-navy">
              S'inscrire à {event.title}
            </h3>

            <form /*onSubmit={handleSubmit}*/ className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="prenom" className="block text-[15px] font-semibold text-neutral-900">
                    Prénom
                  </label>
                  <input
                    id="prenom"
                    type="text"
                    required
                    value={form.prenom}
                    onChange={handleChange("prenom")}
                    placeholder="Entrer votre prénom"
                    className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="nom" className="block text-[15px] font-semibold text-neutral-900">
                    Nom
                  </label>
                  <input
                    id="nom"
                    type="text"
                    required
                    value={form.nom}
                    onChange={handleChange("nom")}
                    placeholder="Entrer votre nom"
                    className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[15px] font-semibold text-neutral-900">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="Entrer votre adresse email"
                    className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-[15px] font-semibold text-neutral-900">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    required
                    value={form.telephone}
                    onChange={handleChange("telephone")}
                    placeholder="Entrer votre numéro"
                    className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-[15px] font-semibold text-neutral-900">
                  Message <span className="font-normal text-neutral-400">(optionnel)</span>
                </label>
                <textarea
                  id="message"
                  rows={2}
                  value={form.message}
                  onChange={handleChange("message")}
                  placeholder="Une précision à nous transmettre ?"
                  className="mt-2 w-full resize-none border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={handleChange("consent")}
                  className="mt-0.5 h-4 w-4 shrink-0 border-neutral-300"
                />
                <label htmlFor="consent" className="text-[13px] leading-relaxed text-neutral-500">
                  J'accepte que mes données soient utilisées pour traiter mon inscription à cet événement.
                </label>
              </div>

              <button type="submit" className={`mt-2 ${buttonStyles.solid}`}>
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}