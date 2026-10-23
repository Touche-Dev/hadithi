import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/site/Reveal";
import { PageHeader, SectionTitle, buttonStyles } from "@/components/site/ui";
import { Seo } from "@/components/site/Seo";
import { Link } from "react-router-dom";
import bgNewsletter from "@/assets/bg/bg-newsletter.webp";
import { LuBookOpenCheck } from "react-icons/lu";

const recherche = [
  "Une trajectoire ou une analyse qui a quelque chose à apprendre au lecteur sur le monde qui vient",
  "Un ancrage terrain — décideur, diplomate, entrepreneur, figure politique, praticien du changement",
  "Une exigence de clarté : la complexité traduite en langage lisible, sans sacrifice de rigueur",
  "Une cohérence avec l'une de nos collections (Legacy, Visions du Monde, Kids)",
];

const processus = [
  {
    t: "Réception et accusé de réception",
    d: "Confirmation de bonne réception de votre dossier.",
  },
  {
    t: "Première lecture",
    d: "Évaluation par au moins deux membres du comité de lecture (universitaires, praticiens du développement, journaliste spécialisé).",
  },
  {
    t: "Grille d'évaluation",
    d: "Originalité, rigueur, lisibilité, pertinence, potentiel de portée.",
  },
  {
    t: "Retour",
    d: "Réponse motivée, favorable ou non, dans un délai de 8 à 10 semaines.",
  },
  {
    t: "Proposition de contrat",
    d: "En cas d'avis favorable, présentation des conditions d'édition et accompagnement dédié.",
  },
];

type Errors = Record<string, string>;

const field =
  "w-full rounded-sm border border-navy/25 bg-card px-4 py-3 text-sm text-navy transition-colors placeholder:text-navy/35 focus:border-navy focus:outline-none";

export function SubmitManuscriptPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    const req = (k: string, label: string) => {
      if (!String(data.get(k) ?? "").trim()) next[k] = `$"block text-[18px] font-semibold" est requis.`;
    };
    req("nom", "Le nom");
    req("email", "L'email");
    req("titre", "Le titre du manuscrit");
    req("genre", "Le genre");
    req("resume", "Le résumé");
    req("presentation", "La présentation de l'auteur");
    const email = String(data.get("email") ?? "");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next["email"] = "Adresse email invalide.";
    const resume = String(data.get("resume") ?? "").trim();
    if (resume && resume.split(/\s+/).length > 300)
      next["resume"] = "Le résumé ne doit pas dépasser 300 mots.";
    const presentation = String(data.get("presentation") ?? "").trim();
    if (presentation && presentation.split(/\s+/).length > 200)
      next["presentation"] = "La présentation ne doit pas dépasser 200 mots.";
    if (!data.get("consentement")) next["consentement"] = "Votre consentement est requis.";

    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      e.currentTarget.reset();
    }
  }

  const Err = ({ k }: { k: string }) =>
    errors[k] ? (
      <p className="mt-2 text-sm text-destructive" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <>
      <Seo
        title="Soumettre un manuscrit — Hadithi Publishers"
        description="Essais, mémoires, récits politiques et histoires de vie : soumettez votre manuscrit à Hadithi Publishers. Réponse motivée sous 8 à 10 semaines."
      />

      <PageHeader
        tone="manuscrit"
        eyebrow="Manuscrits"
        title="Soumettre un manuscrit"
        intro=""
      />
      <section className="intro">
        <div className="container-editorial pt-20 py-10">
          <p className="text-[20px] leading-[30px] sm:text-[25px] sm:leading-[35px]">
            Hadithi Publishers accueille les manuscrits d'essais, de mémoires, de récits politiques et d'histoires de vie portant sur des parcours singuliers. Nous ne cherchons pas des titres académiques, mais des voix qui ont vécu et compris de l'intérieur ce qu'elles racontent.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="container-editorial py-24">
          <SectionTitle eyebrow="Manuscrits" title="Ce que nous recherchons" />
          <Reveal delay={100} className="mt-10 grid gap-x-14 gap-y-10 md:grid-cols-2 pt-5">
            {recherche.map((r) => (
              <div key={r} className="border-t border-navy/20 pt-6">
                <p className="text-lg leading-relaxed">{r}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-navy text-cream">
        <div className="container-editorial py-24">
          <SectionTitle eyebrow="Évaluation" title="Notre processus d'évaluation" />

          <div className="relative mt-14 pt-5">
            {/* ligne pointillée */}
            <div className="absolute bottom-0 left-7 top-0 -translate-x-1/2 border-l-2 border-dashed border-cream/30 md:left-1/2" />

            <ol className="space-y-8 md:space-y-4">
              {processus.map((p, i) => (
                <li key={p.t} className="group relative grid md:grid-cols-2">
                  {/* corde reliant la carte à la ligne */}
                  <div
                    aria-hidden
                    className={`absolute top-[44px] left-7 w-[3.25rem] border-t-2 border-cream/40 md:w-16 ${i % 2 === 0 ? "md:left-auto md:right-1/2" : "md:left-1/2"
                      }`}
                  />

                  {/* pastille numérotée */}
                  <span
                    className="absolute left-7 top-4 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-cream font-archivo text-[30px] leading-none text-transparent ring-4 ring-navy transition-transform duration-300 group-hover:scale-105 md:left-1/2"
                    style={{ WebkitTextStroke: "1px var(--navy)" }}
                  >
                    {i + 1}
                  </span>

                  <Reveal
                    delay={i * 100}
                    className={`ml-20 rounded-sm border border-cream/20 p-6 md:ml-0 ${i % 2 === 0 ? "md:col-start-1 md:mr-16" : "md:col-start-2 md:ml-16"
                      }`}
                  >
                    <h3 className="font-display text-lg font-bold text-cream">{p.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white">{p.d}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-editorial py-24 pb-0">
          <SectionTitle eyebrow="" title="Envoyer mon manuscrit" />

          {sent ? (
            <div
              className="mt-10 w-full rounded-sm border border-navy/20 bg-neutral-50 p-8"
              role="status"
            >
              <p className="editorial-quote text-2xl text-navy">
                Votre dossier a bien été envoyé.
              </p>
              <p className="mt-3 text-sm text-neutral-700">
                Vous recevrez un accusé de réception, puis une réponse motivée, favorable ou non,
                dans un délai de 8 à 10 semaines.
              </p>
            </div>
          ) : null}

          <form
            onSubmit={onSubmit}
            noValidate
            className="mx-auto mt-10 grid w-[100%] gap-x-10 gap-y-8 sm:grid-cols-2"
          >
            <div>
              <label htmlFor="nom" className="block text-[18px] font-semibold">
                Nom et prénom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                placeholder="Entrer votre nom et prénom"
                className="mt-4 w-full rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
              />
              <Err k="nom" />
            </div>

            <div>
              <label htmlFor="email" className="block text-[18px] font-semibold">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Entrer votre adresse email"
                className="mt-4 w-full rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
              />
              <Err k="email" />
            </div>

            <div>
              <label htmlFor="telephone" className="block text-[18px] font-semibold">
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                placeholder="Entrer votre numéro de téléphone"
                className="mt-4 w-full rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label htmlFor="titre" className="block text-[18px] font-semibold">
                Titre du manuscrit
              </label>
              <input
                id="titre"
                name="titre"
                type="text"
                placeholder="Entrer le titre de votre manuscrit"
                className="mt-4 w-full rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
              />
              <Err k="titre" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="genre" className="block text-[18px] font-semibold">
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                defaultValue=""
                className="mt-4 w-full rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-5 text-[15px] text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-0"
              >
                <option value="" disabled>
                  Choisir un genre
                </option>
                <option>Essai</option>
                <option>Mémoires</option>
                <option>Récit politique</option>
                <option>Histoire de vie</option>
              </select>
              <Err k="genre" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="resume" className="block text-[18px] font-semibold">
                Résumé (300 mots maximum)
              </label>
              <textarea
                id="resume"
                name="resume"
                rows={3}
                placeholder="Résumez votre manuscrit"
                className="mt-4 w-full resize-none rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
              />
              <Err k="resume" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="manuscrit" className="block text-[18px] font-semibold">
                Extrait ou manuscrit complet (PDF / Word)
              </label>
              <input
                id="manuscrit"
                name="manuscrit"
                type="file"
                accept=".pdf,.doc,.docx"
                className="mt-4 w-full cursor-pointer rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-3 text-[15px] text-neutral-800 
    file:mr-4 file:cursor-pointer file:rounded-[3px] file:border file:border-solid file:border-[#767676] file:bg-[#efefef] file:px-2 file:py-px file:text-black 
    focus:border-neutral-900 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="presentation" className="block text-[18px] font-semibold">
                Présentation de l'auteur (200 mots)
              </label>
              <textarea
                id="presentation"
                name="presentation"
                rows={3}
                placeholder="Présentez-vous brièvement"
                className="mt-4 w-full resize-none rounded-none border-0 border-b-2 border-neutral-300 bg-transparent pb-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0"
              />
              <Err k="presentation" />
            </div>

            <div className="sm:col-span-2 flex items-start gap-3">
              <input
                id="consentement"
                name="consentement"
                type="checkbox"
                className="mt-1.5 h-4 w-4 shrink-0 accent-[color:var(--navy)]"
              />
              <label
                htmlFor="consentement"
                className="flex items-start gap-3 text-sm text-[18px]"
              >
                J'accepte le traitement de mes données dans le cadre de l'évaluation de mon
                manuscrit et confirme l'exclusivité de lecture pendant la durée du processus.
              </label>
              <Err k="consentement" />
            </div>

            <div className="sm:col-span-2">
              <button type="submit" className={buttonStyles.solid}>
                Envoyer mon manuscrit
              </button>
            </div>
          </form>
        </div>
      </section>


      <section className="py-24 pt-10">
        <div className="container-editorial">
          <div className="flex items-start gap-4 text-navy">
            <p className="text-[20px] font-[900] ">
              Chaque manuscrit est lu avec la même exigence, la vôtre. <br className="hidden lg:block" /> Nous répondons à chaque
              auteur, favorablement ou non, avec un retour construit.
            </p>
          </div>
        </div>
      </section>


    </>
  );
}
