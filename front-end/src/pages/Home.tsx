import { Link } from "react-router-dom";
import { Reveal } from "@/components/site/Reveal";
import { Newsletter } from "@/components/site/Newsletter";
import { Seo } from "@/components/site/Seo";
import { BookCard, SectionTitle, buttonStyles, DemoTag } from "@/components/site/ui";
import { books, events } from "@/lib/content";
import heroBg from "@/assets/bg/bg-hero.webp";
import identity from "@/assets/identity.webp";
import bgNewsletter from "@/assets/bg/bg-newsletter.webp";
import { PiScales, PiFingerprint, PiMicrophoneStage } from "react-icons/pi";
import { LuBookOpen, LuUsersRound, LuGlobe } from "react-icons/lu";
import { X, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectBooks } from "@/store/catalogSelectors";
import { selectCollections, selectAuthors } from "@/store/catalogSelectors";
import legacy from "../assets/legacy.webp";
import visionMonde from "../assets/vision-du-monde.webp";
import kids from "../assets/kids.webp";
import { cn } from "@/lib/utils";
import { useMemo } from "react";




const pourquoi = [
  {
    icon: LuBookOpen,
    title: "Une ligne resserrée, pas un catalogue fourre-tout",
    text: "Chaque titre répond à une question simple : cette trajectoire a-t-elle quelque chose à apprendre au lecteur sur le monde qui vient ? Une identité reconnaissable dès la couverture.",
  },
  {
    icon: LuUsersRound,
    title: "Des auteurs choisis pour ce qu'ils ont vécu",
    text: "Décideurs, diplomates, entrepreneurs, activistes, figures politiques, change-makers pas seulement pour leur titre, mais pour ce qu'ils ont compris de l'intérieur.",
  },
  {
    icon: LuGlobe,
    title: "Une présence vivante, pas seulement en librairie",
    text: "Nous vendons nos livres où les histoires se racontent sommets, conférences, rencontres avec les auteurs présents, en marge des lancements.",
  },
];


function NewsletterCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleChange =
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMsg(null);
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // URL du serveur (ajustez le port si nécessaire, ex: 3006)
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3006";

    try {
      const res = await fetch(`${API_URL}/api/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.nom,
          email: form.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'inscription.");
      }

      setSuccessMsg(data.message);
      setForm({ nom: "", email: "" });

      // Fermeture automatique de la modale après 2,5 secondes
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CTA : Bannière */}
      <section className="py-24">
        <div className="container-editorial">
          <Reveal>
            <div
              className="relative w-full overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat px-2 lg:px-8 py-15 lg:py-25 text-center"
              style={{ backgroundImage: `url(${bgNewsletter})` }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(180deg, rgba(5,24,46,0.80) 0%, rgba(5,24,46,0.80) 60%, rgba(5,24,46,0.90) 100%)`,
                }}
              />

              <div className="relative z-10">
                <h2 className="text-[45px] font-bold text-white">
                  Ne manquez aucun récit
                </h2>
                <p className="mx-auto mt-4 mb-10 max-w-[95%] xl:max-w-[80%] text-[18px] leading-[28px] text-white">
                  Recevez nos parutions, les coulisses d'un manuscrit du premier comité de
                  lecture jusqu'à la couverture finale, et nos rencontres d'auteurs en marge
                  des événements. Une à deux fois par mois.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setIsOpen(true);
                    }}
                    className={buttonStyles.ghostOnNavy}
                  >
                    S'abonner
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Modal d'inscription newsletter */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-[100%] lg:max-w-[70%] xl:max-w-[55%] bg-cream p-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
              className="absolute right-6 top-6 text-neutral-400 transition-colors hover:text-neutral-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="pr-8 text-[22px] font-semibold leading-snug font-heading-ariata text-navy">
              Ne manquez aucune actualité de Hadithi Publishers !
            </h3>

            {/* Message de succès */}
            {successMsg ? (
              <div className="mt-6 rounded border border-green-600/30 bg-green-50 p-4 text-green-800 text-[15px]">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Message d'erreur */}
                {errorMsg && (
                  <p className="text-sm font-semibold text-red-600">
                    {errorMsg}
                  </p>
                )}

                <div>
                  <label
                    htmlFor="nom"
                    className="block text-[15px] font-semibold text-neutral-900"
                  >
                    Nom et prénoms
                  </label>
                  <input
                    id="nom"
                    type="text"
                    required
                    value={form.nom}
                    onChange={handleChange("nom")}
                    placeholder="Entrer votre nom et prénoms"
                    className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-[15px] font-semibold text-neutral-900"
                  >
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

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 ${buttonStyles.solid}`}
                >
                  {loading ? "Inscription en cours..." : "S'abonner"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function HomePage() {
  //const derniers = books.slice(0, 6);
  const affiche = events.filter((e) => !e.past).slice(0, 2);


  const derniers = useSelector(selectBooks)
  const collectionList = useSelector(selectCollections)

  // derniers est trié du plus récent au plus ancien
  const [first, second, third] = derniers;

  // Le plus récent au centre : gauche = 2e, centre = 1er, droite = 3e
  const featured = [second, first, third].filter(Boolean);

  const featuredClasses = [
    "h-80 w-50 translate-y-10", // gauche
    "h-90 w-55",                // centre
    "h-80 w-50 translate-y-10", // droite
  ];



  const authors = useSelector(selectAuthors);
  const collections = useSelector(selectCollections);

  const authorBySlug = useMemo(
    () => Object.fromEntries(authors.map((a) => [a.slug, a])),
    [authors],
  );

  const collectionById = useMemo(
    () => Object.fromEntries(collections.map((c) => [c.id, c])),
    [collections],
  );

  const catalogue = useSelector((state: any) => state.catalog);
  console.log(catalogue);

  return (
    <>
      <Seo
        title="Hadithi Publishers — Les récits qui transforment"
        description="Maison d'édition indépendante : essais, mémoires et récits politiques de trajectoires qui ont quelque chose à apprendre au monde qui vient."
      />

      {/* Hero */}
      <section className="grain relative isolate overflow-hidden text-cream max-[380px]:h-[520px] h-[600px] xl:h-[800px] ">
        <img
          src={heroBg}
          alt="Joyeux étudiant de sexe masculin à la peau foncée passant du temps en autodidacte à la bibliothèque avec un livre, positif"
          data-placeholder="true"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[hero-zoom_18s_ease-out_forwards]"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to top, color-mix(in oklab, var(--navy) 92%, transparent) 0%, color-mix(in oklab, var(--navy) 70%, transparent) 45%, color-mix(in oklab, var(--navy) 28%, transparent) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-navy/25" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            background: "radial-gradient(60% 55% at 72% 30%, var(--light-blue), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container-editorial relative grid gap-14 pt-[100px] max-[380px]:pt-[0px] xl:pt-[200px] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <Reveal className="pt-25">
            <h1 className="text-[35px] max-[380px]:text-[28px] sm:text-[42px] lg:text-[60px]">
              Hadithi. En swahili,
              <br />
              cela veut dire récit.
            </h1>
            <p className="mt-8 max-w-xl text-[19px] leading-[29px] text-cream">
              Une maison d'édition indépendante qui publie les trajectoires qui ont quelque chose à
              apprendre au monde qui vient.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/livres" className={buttonStyles.onNavy}>
                Découvrir nos livres
              </Link>
              <Link to="/soumettre-un-manuscrit" className={buttonStyles.ghostOnNavy}>
                Soumettre un manuscrit
              </Link>
            </div>

          </Reveal>

          <Reveal delay={120} className="hidden xl:block">
            <div className="relative mx-auto flex h-[25rem] w-full max-w-md items-end justify-center">
              <div className="absolute bottom-16 h-56 w-56 rounded-full bg-light-blue/20 blur-3xl" />
              <div className="relative flex gap-4">
                {featured.map((book, i) => (
                  <Link
                    key={book.slug}
                    to={`/livres/${book.slug}`}
                    aria-label={`Découvrir ${book.title}`}
                  >
                    <div
                      className={`${featuredClasses[i]} cursor-pointer transition-transform duration-500 ease-out hover:scale-110`}
                    >
                      <img
                        src={`https://linen-cassowary-757431.hostingersite.com${book.cover_url}`}
                        alt={book.title}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Signature de marque */}
      <section className="bg-background">
        <div className="container-editorial py-32 pb-20">
          <div className="grid gap-10 lg:grid-cols-2 items-stretch pb-0">
            <div className="h-full w-full">
              <img
                src={identity}
                alt="Joyeux étudiant de sexe masculin à la peau foncée passant du temps en autodidacte à la bibliothèque avec un livre, positif"
                data-placeholder="true"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
            <Reveal>
              <SectionTitle eyebrow="Notre identité" title="" />
              <p className="pb-5 editorial-quote text-[30px] font-[600]">
                Il y a des vies qui répondent à une question avant même qu'on la pose.
              </p>
              <p className="text-lg text-black">
                Hadithi Publishers existe pour les mettre en livre, essais, mémoires, récits
                politiques d'hommes et de femmes qui ont traversé l'adversité, changé de direction, ou
                porté une idée jusqu'à la transformer en réalité.
              </p>
              <p className="text-lg mt-2 text-black">
                Le nom vient du conteur swahili : celui qui rassemble un village autour d'une histoire
                vraie pour en tirer une leçon. Nous ne publions rien d'autre.
              </p>

              <div className="mt-10">
                <a href="/a-propos" className={` ${buttonStyles.outline}`} >
                  En savoir plus sur Hadithi
                </a>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* Ce que nous ne publions pas 
      <section
        className="relative text-cream overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgNewsletter})` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(5,24,46,0.45) 0%, rgba(5,24,46,0.68) 60%, rgba(5,24,46,0.78) 100%)`,
          }}
        />

        <div className="container-editorial relative z-10 py-24 md:py-28 text-center">
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <SectionTitle eyebrow="Ligne éditoriale" title="Ce que nous ne publions pas" />
            </div>
            <p className="mt-8 max-w-4xl mx-auto text-lg">
              Nous refusons les manuscrits qui racontent un succès sans en montrer le prix. Nous
              refusons la théorie sans le terrain, et le terrain sans la mise en perspective. Nous
              refusons de diluer une trajectoire forte dans un catalogue qui en compte cent autres.
            </p>
          </Reveal>
        </div>
      </section>*/}

      {/* Ce que nous ne publions pas */}
      <section className="bg-warm-grey text-navy">
        <div className="container-editorial py-24 md:py-28">
          <Reveal>
            <SectionTitle eyebrow="Ligne éditoriale" title="Ce que nous ne publions pas" />

            <p className="mt-8 max-w-4xl text-lg text-black">
              Nous refusons les manuscrits qui racontent un succès sans en montrer le prix. Nous
              refusons la théorie sans le terrain, et le terrain sans la mise en perspective. Nous
              refusons de diluer une trajectoire forte dans un catalogue qui en compte cent autres.
            </p>
          </Reveal>
        </div>
      </section>



      {/* Pourquoi Hadithi */}
      <section className="bg-background">
        <div className="container-editorial py-24 md:py-32">
          <Reveal>
            <SectionTitle eyebrow="Notre exigence" title="Pourquoi Hadithi ?" />
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {pourquoi.map((item, i) => {
              const isActive = i === 7;
              return (
                <Reveal key={item.title} delay={i * 100}>
                  <div
                    className={`group relative min-h-[280px] h-full rounded-[0px] border p-7 transition-all duration-300 cursor-pointer ${isActive
                      ? "bg-[#05182E] border-[#05182E]"
                      : "bg-[#FBFAF7] border-[#182335]/10"
                      }`}
                  >
                    {item.icon && (
                      <div
                        className={`inline-flex h-13 w-13 items-center justify-center rounded-[14px] transition-colors duration-300 ${isActive
                          ? "bg-white text-[#05182E]"
                          : "bg-[#f0f0f0] text-[#182335] group-hover:bg-[#05182E] group-hover:text-white"
                          }`}
                      >
                        <item.icon className="text-[25px]" />
                      </div>
                    )}

                    <h3 className={`mt-5 text-xl ${isActive ? "text-white" : "text-navy"}`}>
                      {item.title}
                    </h3>
                    <p className={`text-black mt-3 text-[15px] ${isActive ? "text-white/95" : "text-navy/80"}`}>
                      {item.text}
                    </p>

                    <span
                      aria-hidden="true"
                      className="absolute top-4 right-5 select-none font-archivo text-[60px] leading-none text-transparent transition-transform duration-300 group-hover:translate-x-[-4px] group-hover:scale-105"
                      style={{
                        WebkitTextStroke: isActive
                          ? "1px rgba(255,255,255,0.35)"
                          : "1px rgba(24,35,53,0.18)",
                      }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="bg-navy text-cream">
        <div className="container-editorial py-24 md:py-32">
          <Reveal>
            <SectionTitle
              eyebrow="Trois collections"
              title="Une même exigence : celle du récit qui éclaire"
              className="[&_p]:text-light-blue"
            />
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {collectionList.map((c, i) => (
              <Reveal key={c.id} delay={i * 100}>
                <article className="card-surface-navy flex h-full flex-col rounded-sm p-7 cursor-pointer">
                  <div className="h-[280px] w-full overflow-hidden">
                    <img
                      src={c.id == "kids" ? kids : c.id == "legacy" ? legacy : visionMonde}
                      alt={c.alt}
                      data-placeholder="true"
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-8">
                    <span className={`block h-1.5 w-30 ${c.badge}`} />
                    <h3 className="mt-6 font-display text-2xl">{c.name}</h3>
                    <p className="mt-4 text-[18px] leading-relaxed text-white">
                      {c.tagline}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>


          <Reveal delay={200}>
            <div className="mt-12">
              <Link to="/a-propos#collections" className={`${buttonStyles.onNavy}`}>
                Explorer nos collections
              </Link>
            </div>
          </Reveal>

        </div>
      </section>

      {/* Derniers titres */}
      <section className="bg-background">
        <div className="container-editorial py-24 md:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow="Catalogue" title="Derniers titres" />
            <Link to="/livres" className={buttonStyles.outline}>
              Voir tous les livres
            </Link>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 items-stretch">
            {derniers.slice(0, 8).map((book, i) => {
              const collection = collectionById[book.collection_id];
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
                            data-placeholder="true"
                            loading="eager"
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
                              collection?.badge,
                            )}
                          >
                            {collection?.name}
                          </span>

                          <p className="text-sm font-medium tabular-nums">
                            {(book.price_cents)} €
                          </p>
                        </div>
                        <h3 className="text-balance-tight text-lg font-extrabold leading-tight line-clamp-2">{book.title}</h3>
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
              )
            })}
          </div>
        </div>
      </section>

      {/* À l'affiche
      <section className="bg-warm-grey">
        <div className="container-editorial py-24 md:py-28">
          <Reveal>
            <SectionTitle eyebrow="Rencontres" title="À l'affiche" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {affiche.map((e, i) => (
              <Reveal key={e.slug} delay={i * 100}>
                <Link
                  to={`/events/${e.slug}`}
                  className="card-surface group flex h-full flex-col justify-between rounded-sm p-8"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="eyebrow text-muted-foreground">{e.type}</span>
                    <DemoTag />
                  </div>
                  <h3 className="mt-5 text-2xl">{e.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {e.dateLabel} · {e.city}
                  </p>
                  <span className="eyebrow mt-6 inline-flex items-center gap-2">
                    En savoir plus
                    <span className="h-px w-6 bg-navy transition-all duration-300 group-hover:w-10" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section> */}

      {/* Newsletter
      <section className="bg-background">
        <div
          className="container-editorial relative grid gap-10 min-h-[520px] md:min-h-[400px] mb-24 md:grid-cols-2 md:items-center overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgNewsletter})` }}
        >
          
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(5,24,46,0.45) 0%, rgba(5,24,46,0.68) 60%, rgba(5,24,46,0.78) 100%)`,
            }}
          />

          <Reveal className="relative z-10 px-8 md:px-12">
            <span className="inline-block text-[12px] tracking-[0.2em] uppercase text-cream mb-4">
              Newsletter
            </span>
            <h2 className="text-[32px] md:text-[45px] font-semibold leading-[1.15] text-cream">
              Ne manquez aucun récit.
            </h2>

            <p className="mt-3 max-w-md text-[20px] leading-[30px] text-cream/80">
              Recevez nos parutions, nos rencontres d'auteurs et nos coulisses éditoriales, une à
              deux fois par mois.
            </p>
          </Reveal>

          <Reveal delay={100} className="relative z-10 px-8 md:px-12">
            <Newsletter />
          </Reveal>
        </div>
      </section>*/}


      <NewsletterCTA />



    </>
  );
}
