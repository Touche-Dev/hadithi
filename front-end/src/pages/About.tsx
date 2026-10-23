import { Link, useLocation } from "react-router-dom";
import { Reveal } from "@/components/site/Reveal";
import { PageHeader, PlaceholderPhoto, SectionTitle, buttonStyles } from "@/components/site/ui";
import { Seo } from "@/components/site/Seo";
import { editorialImages } from "@/lib/images";
import { collectionList, contact } from "@/lib/content";
import { useEffect, useState } from "react";
import { FiTarget, FiUsers, FiEdit3, FiMic, FiBookOpen, FiMail, FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import historyImg from "@/assets/history.webp";
import modele01 from "@/assets/modele-01.webp";
import modele02 from "@/assets/modele-02.webp";
import metiers01 from "@/assets/metiers-01.webp";
import metiers02 from "@/assets/metiers-02.webp";
import bookClubMain from "@/assets/hadithi-book-club.webp";
import bookClub01 from "@/assets/book-club-01.webp";
import bookClub02 from "@/assets/book-club-02.webp";
import bookClub03 from "@/assets/book-club-03.webp";
import academyMain from "@/assets/hadithi-academy.webp";
import academy01 from "@/assets/hadithi-academy-01.webp";
import academy02 from "@/assets/hadithi-academy-02.webp";
import academy03 from "@/assets/hadithi-academy-03.webp";




const distinctions = [
  {
    t: "Une ligne resserrée.",
    d: "Pas de catalogue fourre-tout. Une question suffit à trier un manuscrit : cette trajectoire a-t-elle quelque chose à apprendre au lecteur sur le monde qui vient ? Sinon, nous ne la publions pas.",
  },
  {
    t: "Des auteurs qui ont vécu ce qu'ils racontent.",
    d: "Décideurs, diplomates, entrepreneurs, praticiens du changement. Le titre ne nous intéresse pas ; l'expérience, oui.",
  },
  {
    t: "Une écriture qui ne prend pas le lecteur pour un spécialiste , ni pour un imbécile.",
    d: "La complexité reste entière ; seule l'opacité disparaît.",
  },
  {
    t: "Des livres qui se vendent là où les histoires se racontent.",
    d: "Sommets, conférences, rencontres , l'auteur présent, la conversation ouverte. C'est notre réseau qui rend cela possible ; c'est aussi ce qui nous distingue d'un éditeur de bureau.",
  },
];

const modele = [
  {
    t: "Vente directe événementielle",
    d: "Nous vendons une part significative de nos ouvrages lors de sommets, conférences et rencontres, avec l'auteur présent. Ce canal, unique dans notre secteur, nous permet un dialogue direct entre l'auteur et son lecteur, et garantit une exigence de qualité à chaque lancement.",
  },
  {
    t: "Diffusion en librairie",
    d: "Nos ouvrages sont progressivement référencés auprès d'un réseau de diffuseurs-distributeurs spécialisés en sciences humaines, ainsi qu'auprès de librairies indépendantes en France et en Afrique francophone (Dakar, Abidjan, Yaoundé, Cotonou).",
  },
  {
    t: "Édition numérique",
    d: "Chaque titre est disponible simultanément en version papier et numérique (e-book, et exploration progressive de l'audio), sur l'ensemble des plateformes de référence.",
  },
  {
    t: "Notre comité de lecture",
    d: "Chaque manuscrit est évalué par un comité associant universitaires, praticiens du développement et journalistes spécialisés, sur la base d'une grille standardisée : originalité, rigueur, lisibilité, pertinence, potentiel de portée. Cette rigueur de sélection est la garantie que porte chaque livre Hadithi.",
  },
];

const metiers = [
  {
    t: "Direction éditoriale",
    d: "Le choix des manuscrits, l'accompagnement de l'auteur dans la structuration de son texte, l'arbitrage entre rigueur et accessibilité — c'est le cœur de notre exigence éditoriale.",
  },
  {
    t: "Comité de lecture",
    d: "Universitaires, praticiens du développement, journalistes spécialisés : ce collectif évalue chaque manuscrit selon une grille rigoureuse, garantissant l'exigence qui définit chaque titre Hadithi.",
  },
  {
    t: "Correction et relecture",
    d: "Un travail de précision sur la langue, la cohérence et la fluidité du texte, pour que chaque manuscrit atteigne son meilleur niveau avant publication.",
  },
  {
    t: "Maquette et design",
    d: "Mise en page intérieure et conception de couverture : chaque livre Hadithi doit être reconnaissable dès le premier regard, dans le respect de l'identité propre à chaque collection.",
  },
  {
    t: "Production et impression",
    d: "Coordination avec nos imprimeurs et nos partenaires d'impression à la demande, pour garantir la qualité de fabrication tout en maîtrisant les tirages et les invendus.",
  },
  {
    t: "Diffusion et distribution",
    d: "Développement du réseau de diffuseurs, de librairies partenaires en France et en Afrique francophone, et des plateformes numériques.",
  },
  {
    t: "Événementiel et relation auteurs",
    d: "Organisation des lancements, présence aux sommets et conférences, coordination des rencontres entre auteurs et lecteurs — un métier à part entière chez Hadithi, qui nous distingue d'un éditeur de bureau.",
  },
  {
    t: "Communication et notoriété",
    d: "Relations presse, newsletter, réseaux sociaux, valorisation du catalogue et des auteurs auprès de nos publics : décideurs, académiques, entrepreneurs et grand public cultivé.",
  },
];

export function AboutPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [hash]);


  const [modal, setModal] = useState<"club" | "academy" | null>(null);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);
  return (
    <>
      <Seo
        title="À propos — Notre Maison | Hadithi Publishers"
        description="Notre Maison, nos collections, notre modèle éditorial et nos métiers : la maison d'édition indépendante Hadithi Publishers."
      />

      <PageHeader
        tone="apropos"
        eyebrow="À propos"
        title="Notre Maison"
        intro=""
      />



      {/* Notre Maison */}
      <section id="notre-maison" className="scroll-mt-40 bg-background">
        <div className="container-editorial py-20 lg:py-28">

          <SectionTitle
            eyebrow=""
            title="Des vies vécues, racontées avec exigence"
            className="[&_p]:text-light-blue"
          />

          <p className="mt-7 text-[clamp(1.25rem,2vw,1.6rem)] font-medium text-[black]">
            « Chaque vie a quelque chose à dire. »
          </p>
          <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16 mt-10">
            {/* Texte */}
            <Reveal className="flex flex-col">

              <p className="mt-0 text-lg text-black">
                Hadithi est née d'un constat simple : il existe des vies qui, racontées avec la même rigueur qu'une enquête et la même chaleur qu'une conversation, changent la façon dont on regarde le monde. Nous ne cherchons pas des auteurs qui savent écrire sur un sujet. Nous cherchons des gens qui l'ont vécu, et qui acceptent l'exigence de l'écrire bien.
              </p>
              <p className="mt-2 text-lg text-black">
                Le mot hadithi vient du swahili : le récit. Il porte la tradition du conteur — celui qui rassemble une communauté autour d'une histoire vraie, non pour divertir, mais pour transmettre un sens. C'est la seule ligne éditoriale que nous ayons.
              </p>

              <Reveal delay={100} className="space-y-8 pt-10">
                <div className="border-t border-navy/20 pt-6">
                  <h2 className="font-bold mb-4 text-navy text-[25px] ">Vision</h2>
                  <p className="mt-3 text-lg text-black">
                    Nous voulons devenir, sur les trajectoires qui comptent et les transformations du
                    monde, la maison vers laquelle on se tourne en premier — pas la plus grande, la plus
                    juste.
                  </p>
                </div>
                <div className="border-t border-navy/20 pt-6">
                  <h2 className="font-bold mb-4 text-navy text-[25px] ">Mission</h2>
                  <p className="mt-3 text-lg text-black">
                    Publier des ouvrages rigoureux, accessibles et originaux qui éclairent les
                    trajectoires uniques, les dynamiques de transformation du monde et les questions de
                    leadership et de gouvernance.
                  </p>
                </div>
              </Reveal>
            </Reveal>

            {/* Image */}
            {/* Image : même hauteur que le texte */}
            <Reveal delay={100} className="relative min-h-[320px] lg:min-h-0">
              <img
                src={historyImg}
                alt="Écriture à la main sur un bureau"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </Reveal>
          </div>

          <div className="bg-background pt-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Titre */}
              <Reveal className="lg:col-span-4">
                <p className="text-[28px] font-bold leading-tight text-navy sm:text-[32px] lg:sticky lg:top-32 lg:text-[35px]">
                  Ce qui nous distingue
                </p>
              </Reveal>

              {/* Cartes */}
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:col-span-8">
                {distinctions.map((d, i) => (
                  <Reveal key={d.t} delay={i * 80} className="h-full">
                    <div className="flex h-full flex-col">
                      {/* Ligne du haut : segment, icône, segment */}
                      <div className="flex h-10 items-center">
                        <div className="w-6 border-t-2 border-navy/25" />
                        <div className="px-3 text-navy">
                          {i === 0 && <FiTarget size={40} strokeWidth={1.25} />}
                          {i === 1 && <FiUsers size={40} strokeWidth={1.25} />}
                          {i === 2 && <FiEdit3 size={40} strokeWidth={1.25} />}
                          {i === 3 && <FiMic size={40} strokeWidth={1.25} />}
                        </div>
                        <div className="flex-1 border-t-2 border-navy/25" />
                      </div>

                      {/* Corps : les côtés démarrent au niveau de la ligne (-mt-5 = moitié de h-10) */}
                      <div className="-mt-5 flex-1 border-x-2 border-b-2 border-navy/25 p-6 pt-10 sm:p-8 sm:pt-12">
                        <h3 className="text-lg font-semibold text-navy sm:text-xl">{d.t}</h3>
                        <p className="mt-3 text-[15px] leading-relaxed text-black text-neutral-800 sm:mt-4">
                          {d.d}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Collections */}
      <section id="collections" className="scroll-mt-40 bg-navy text-cream">
        <div className="container-editorial py-24">

          <SectionTitle
            eyebrow=""
            title="Nos collections"
            className="[&_p]:text-light-blue"
          />
          <p className="mt-6 max-w-4xl text-lg text-cream">
            Trois collections, une même exigence : celle du récit qui éclaire. Chacune s'adresse à
            un moment différent de la vie du lecteur, sans jamais renoncer à la rigueur qui définit
            Hadithi.
          </p>
          <div className="mt-12 space-y-4">
            {collectionList.map((c, i) => {
              // ligne 1, 3, 5… : carte principale à gauche / ligne 2, 4… : à droite
              const mainOnRight = i % 2 === 1;

              return (
                <Reveal key={c.id} delay={i * 100}>
                  <div className="grid items-center gap-6 lg:grid-cols-3">
                    {/* Carte principale : même taille qu'avant */}
                    <article
                      className={`card-surface-navy flex cursor-pointer flex-col rounded-sm p-7 ${mainOnRight ? "lg:order-2" : "lg:order-1"
                        }`}
                    >
                      <div className="h-[280px] w-full shrink-0 overflow-hidden">
                        <img
                          src={c.src}
                          alt={c.alt}
                          data-placeholder="true"
                          loading="eager"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="mt-8">
                        <span className={`block h-1.5 w-24 ${c.swatch}`} />
                        <h3 className="mt-6 font-display text-2xl">{c.name}</h3>
                        <p className="mt-4 text-[18px] leading-relaxed text-white">{c.tagline}</p>
                      </div>
                    </article>

                    {/* Carte descriptive + connecteur, centrés verticalement */}
                    <div
                      className={`flex items-center lg:col-span-2 ${mainOnRight
                        ? "lg:order-1 lg:-mr-6 lg:flex-row"
                        : "lg:order-2 lg:-ml-6 lg:flex-row-reverse"
                        }`}
                    >
                      <div className="w-full rounded-sm border border-cream/20 p-8 lg:p-12">
                        <p className="text-[18px] uppercase text-cream">
                          Collection {c.name}
                        </p>
                        <p className="mt-5 text-[16px] leading-relaxed text-white">{c.description}</p>
                      </div>

                      {/* Connecteur (desktop uniquement) */}
                      <div aria-hidden className="relative hidden h-24 w-12 shrink-0 lg:block">
                        <div className="absolute left-0 right-0 top-1/2 border-t border-cream/30" />

                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-12">
            <Link to="/livres" className={`${buttonStyles.onNavy}`}>
              Voir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Notre modèle */}
      <section id="notre-modele" className="scroll-mt-40 bg-background">
        <div className="container-editorial py-24">
          <SectionTitle
            eyebrow=""
            title="Notre modèle éditorial"
            className="[&_p]:text-light-blue"
          />
          <p className="mt-6 max-w-4xl text-lg leading-relaxed">
            Hadithi Publishers fonctionne à compte d'éditeur : nous sélectionnons, finançons et
            portons intégralement la production de chaque ouvrage que nous publions. Notre modèle
            repose sur trois canaux complémentaires, pensés pour maximiser à la fois la portée de
            chaque titre et la relation directe avec nos lecteurs.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {modele.map((m, i) => (
              <Reveal key={m.t} delay={i * 80}>
                <div className="h-full rounded-sm p-8 border-2 border-2 border-navy/25">
                  <h3 className="text-xl text-navy">{m.t}</h3>
                  <p className="mt-4 text-[15px] text-black ">{m.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <PlaceholderPhoto
              className="aspect-[3.5/2] rounded-sm"
              src={modele01}
              alt="Manuscrit annoté posé sur un bureau de travail"
            />
            <PlaceholderPhoto
              className="aspect-[3.5/2] rounded-sm"
              src={modele02}
              alt="Rayonnage de librairie indépendante"
            />
          </div>
          <div className="mt-14 flex flex-wrap items-center gap-10 border-t border-navy/20 pt-8">
            <p className="text-lg">
              Vous êtes un diffuseur, une librairie ou une institution partenaire ?
            </p>
            <a href={`mailto:${contact.email}`} className={buttonStyles.outline}>
              Contactez-nous
            </a>
          </div>
        </div>
      </section>

      {/* Nos métiers */}
      <section id="nos-metiers" className="scroll-mt-40 bg-warm-grey">
        <div className="container-editorial py-24">
          <SectionTitle
            eyebrow=""
            title="Nos métiers"
            className="[&_p]:text-light-blue"
          />
          <p className="mt-6 max-w-4xl text-lg leading-relaxed">
            Faire exister un livre demande une chaîne de savoir-faire précis, de la première lecture
            du manuscrit jusqu'à la rencontre avec le lecteur. Voici les métiers qui, chez Hadithi,
            donnent corps à chaque récit.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <PlaceholderPhoto
              className="aspect-[3.5/2] rounded-sm"
              src={metiers01}
              alt="Manuscrit annoté posé sur un bureau de travail"
            />
            <PlaceholderPhoto
              className="aspect-[3.5/2] rounded-sm"
              src={metiers02}
              alt="Relecture d'un texte, stylo à la main"
            />
          </div>
          <ol className="mt-14 space-y-0">
            {metiers.map((m, i) => (
              <Reveal as="li" key={m.t} delay={i * 60}>
                <div className="grid gap-4 border-t border-navy/20 py-8 md:grid-cols-[5rem_minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-baseline">
                  <span
                    className="font-archivo text-[30px] leading-none text-transparent transition-transform duration-300 group-hover:translate-x-[-4px] group-hover:scale-105"
                    style={{
                      WebkitTextStroke: "1px rgb(8, 27, 50,0.8)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[20px] font-[700]">{m.t}</p>
                  <p className="text-[18px] font-[200] text-black">{m.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Book Club */}
      <section id="book-club" className="scroll-mt-40 bg-background">
        <div className="container-editorial py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>

              <SectionTitle
                eyebrow=""
                title="Hadithi Book Club"
                className="[&_p]:text-light-blue"
              />
              <p className="mt-3 text-lg font-[700] text-navy">Pour les lecteurs</p>
              <p className="mt-6 text-[18px] text-[black] ">
                Une communauté gratuite pour les lecteurs qui veulent aller plus loin qu'un livre.
                Entrez dans la maison : lisez avant les autres, rencontrez ceux qui ont écrit, et
                suivez la fabrication d'un livre de l'intérieur.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <PlaceholderPhoto
                className="aspect-[3/2] rounded-sm"
                src={bookClubMain}
                alt=""
              />
            </Reveal>
          </div>

          <p className="mt-24 text-[35px] font-bold text-navy">Ce que vous recevez en tant que membre</p>
          <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            <Reveal className="h-full">
              <article className="flex h-full flex-col rounded-sm border-2 border-navy/25 p-6">
                <PlaceholderPhoto
                  className="aspect-[3.5/2] rounded-sm"
                  src={bookClub01}
                  alt="Livre ouvert posé sur une table, à côté d'une bougie"
                />
                <FiBookOpen className="mt-6 text-navy" size={32} strokeWidth={1.25} aria-hidden />
                <h4 className="mt-4 text-xl text-navy">Des extraits en avant-première</h4>
                <p className="mt-3 text-[15px] leading-relaxed text-black">
                  Lisez les premières pages de nos prochaines parutions avant leur sortie en librairie,
                  et dites-nous ce que vous en pensez.
                </p>
              </article>
            </Reveal>
            <Reveal delay={80} className="h-full">
              <article className="flex h-full flex-col rounded-sm border-2 border-navy/25 p-6">
                <PlaceholderPhoto
                  className="aspect-[3.5/2] rounded-sm"
                  src={bookClub02}
                  alt="Intervenant sur scène devant un public"
                />
                <FiUsers className="mt-6 text-navy" size={32} strokeWidth={1.25} aria-hidden />
                <h4 className="mt-4 text-xl text-navy">Des rencontres privées avec nos auteurs</h4>
                <p className="mt-3 text-[15px] leading-relaxed text-black">
                  En marge des sommets et des conférences, un temps réservé aux membres pour poser vos
                  questions à l'auteur, sans micro ni estrade.
                </p>
              </article>
            </Reveal>
            <Reveal delay={160} className="h-full">
              <article className="flex h-full flex-col rounded-sm border-2 border-navy/25 p-6">
                <PlaceholderPhoto
                  className="aspect-[3.5/2] rounded-sm"
                  src={bookClub03}
                  alt="Femme écrivant dans un carnet à la table d'un café"
                />
                <FiMail className="mt-6 text-navy" size={32} strokeWidth={1.25} aria-hidden />
                <h4 className="mt-4 text-xl text-navy">Une lettre mensuelle sur les coulisses</h4>
                <p className="mt-3 text-[15px] leading-relaxed text-black">
                  Comment un manuscrit devient un livre : le premier comité de lecture, les débats
                  d'édition, les choix de couverture, jusqu'à l'impression.
                </p>
              </article>
            </Reveal>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-10 border-t border-navy/20 pt-8">
            <p className="text-lg">
              Envoyez-nous votre prénom par email : vous recevez la prochaine lettre du Book Club.
            </p>
            <button type="button" onClick={() => setModal("club")} className={buttonStyles.outline}>
              Rejoindre le Book Club
            </button>
          </div>
        </div>
      </section>

      {/* Academy */}
      <section id="academy" className="scroll-mt-40 bg-navy text-cream mb-40">
        <div className="container-editorial py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal className="lg:order-2">
              <SectionTitle
                eyebrow=""
                title="Hadithi Academy"
                className="[&_p]:text-light-blue"
              />
              <p className="mt-3 text-lg font-[700] ">Pour les futurs auteurs</p>
              <p className="mt-6 text-[18px] text-white">
                Raconter une trajectoire vraie est un métier. Hadithi Academy propose des ateliers
                courts, animés par notre comité de lecture et nos auteurs publiés, pour celles et ceux
                qui portent une histoire qui mérite d'être bien écrite avant d'être soumise.
              </p>
            </Reveal>
            <Reveal delay={100} className="lg:order-1">
              <PlaceholderPhoto
                className="aspect-[3/2] rounded-sm"
                src={academyMain}
                alt="Deux personnes échangeant autour d'une table de travail"
              />
            </Reveal>
          </div>

          <p className="mt-24 text-[35px] font-bold">Trois ateliers</p>
          <p className="mt-4 max-w-4xl text-lg leading-relaxed">
            Chaque atelier est pratique et en petit groupe. Vous venez avec votre histoire, vous
            travaillez dessus, vous repartez avec quelque chose de concret.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            <Reveal className="h-full">
              <article className="flex h-full flex-col rounded-sm border border-cream/20 p-6">
                <PlaceholderPhoto
                  className="aspect-[3.5/2] rounded-sm"
                  src={academy01}
                  alt="Homme attablé devant un carnet, en train de structurer son récit"
                />
                <FiTarget className="mt-6" size={32} strokeWidth={1.25} aria-hidden />
                <h4 className="mt-4 text-xl">Structurer un récit de vie</h4>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white">
                  Choisir ce que vous racontez, dans quel ordre, et autour de quel fil. Vous travaillez
                  sur votre propre parcours, pas sur un exercice théorique.
                </p>

              </article>
            </Reveal>
            <Reveal delay={80} className="h-full">
              <article className="flex h-full flex-col rounded-sm border border-cream/20 p-6">
                <PlaceholderPhoto
                  className="aspect-[3.5/2] rounded-sm"
                  src={academy02}
                  alt="Deux femmes, stylo en main, en pleine conversation"
                />
                <FiMic className="mt-6" size={32} strokeWidth={1.25} aria-hidden />
                <h4 className="mt-4 text-xl">Passer du témoignage oral au manuscrit</h4>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white">
                  Vous savez raconter votre histoire à voix haute. L'atelier vous apprend à la fixer par
                  écrit sans perdre la voix qui la rend vivante.
                </p>

              </article>
            </Reveal>
            <Reveal delay={160} className="h-full">
              <article className="flex h-full flex-col rounded-sm border border-cream/20 p-6">
                <PlaceholderPhoto
                  className="aspect-[3.5/2] rounded-sm"
                  src={academy03}
                  alt="Homme marchant dans un champ au coucher du soleil"
                />
                <FiEdit3 className="mt-6" size={32} strokeWidth={1.25} aria-hidden />
                <h4 className="mt-4 text-xl">Construire un essai à partir d'une expérience de terrain</h4>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white">
                  Tirer d'un parcours professionnel une analyse et un argument : ce que vous avez compris
                  de l'intérieur, et ce que le lecteur doit en retenir.
                </p>

              </article>
            </Reveal>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-10 border-t border-cream/20 pt-8">
            <p className="text-lg">
              Envoyez-nous l'atelier choisi et votre projet : nous vous répondons avec les prochaines dates.
            </p>
            <button type="button" onClick={() => setModal("academy")} className={buttonStyles.onNavy}>
              S'inscrire à un atelier
            </button>
          </div>
        </div>
      </section>
      {/* Modale Book Club / Academy */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative max-h-[90vh] w-full max-w-[100%] overflow-y-auto bg-cream p-10 shadow-2xl lg:max-w-[70%] xl:max-w-[55%]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModal(null)}
              aria-label="Fermer"
              className="absolute right-6 top-6 text-neutral-400 transition-colors hover:text-neutral-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="pr-8 font-heading-ariata text-[22px] font-semibold leading-snug text-navy">
              {modal === "club"
                ? "Rejoindre le Hadithi Book Club"
                : "S'inscrire à un atelier Hadithi Academy"}
            </h3>
            <p className="mt-3 text-[15px] text-neutral-700">
              {modal === "club"
                ? "C'est gratuit. Vous recevez la lettre mensuelle, les extraits et les invitations aux rencontres."
                : "Dites-nous quel atelier vous intéresse. Nous vous répondons avec les prochaines dates."}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault(); // TODO : brancher l'envoi
              }}
              className="mt-8 space-y-6"
            >
              <div>
                <label htmlFor="modal-nom" className="block text-[15px] font-semibold text-neutral-900">
                  Nom et prénoms
                </label>
                <input
                  id="modal-nom"
                  name="nom"
                  type="text"
                  required
                  placeholder="Entrer votre nom et prénoms"
                  className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                />
              </div>

              <div>
                <label htmlFor="modal-email" className="block text-[15px] font-semibold text-neutral-900">
                  Email
                </label>
                <input
                  id="modal-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Entrer votre adresse email"
                  className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                />
              </div>

              {modal === "club" && (
                <div>
                  <label htmlFor="modal-collection" className="block text-[15px] font-semibold text-neutral-900">
                    Collection qui vous intéresse le plus
                  </label>
                  <select
                    id="modal-collection"
                    name="collection"
                    className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-0"
                  >
                    <option value="">Toutes</option>
                    <option>Legacy</option>
                    <option>Visions du Monde</option>
                    <option>Kids</option>
                  </select>
                </div>
              )}

              {modal === "academy" && (
                <>
                  <div>
                    <label htmlFor="modal-atelier" className="block text-[15px] font-semibold text-neutral-900">
                      Atelier choisi
                    </label>
                    <select
                      id="modal-atelier"
                      name="atelier"
                      required
                      defaultValue=""
                      className="mt-2 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-0"
                    >
                      <option value="" disabled>Choisir un atelier</option>
                      <option>Structurer un récit de vie</option>
                      <option>Passer du témoignage oral au manuscrit</option>
                      <option>Construire un essai à partir d'une expérience de terrain</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="modal-projet" className="block text-[15px] font-semibold text-neutral-900">
                      Votre projet en deux lignes
                    </label>
                    <textarea
                      id="modal-projet"
                      name="projet"
                      required
                      rows={2}
                      maxLength={300}
                      placeholder="Décrivez brièvement votre histoire ou votre sujet"
                      className="mt-2 w-full resize-none border-0 border-b border-neutral-300 bg-transparent pb-2 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
                    />
                  </div>
                </>
              )}

              <button type="submit" className={`mt-2 ${buttonStyles.solid}`}>
                {modal === "club" ? "Rejoindre le Book Club" : "S'inscrire"}
              </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
