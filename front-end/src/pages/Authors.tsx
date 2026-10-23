import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Reveal } from "@/components/site/Reveal";
import { PageHeader, PlaceholderPhoto, buttonStyles } from "@/components/site/ui";
import { Seo } from "@/components/site/Seo";
import { authorFallback } from "@/lib/images";
import { selectAuthors, selectCatalogStatus } from "@/store/catalogSelectors";

export function AuthorsPage() {
  const authors = useSelector(selectAuthors);
  const status = useSelector(selectCatalogStatus);

  return (
    <>
      <Seo
        title="Nos auteurs — Hadithi Publishers"
        description="Décideurs, diplomates, entrepreneurs, figures politiques : les auteurs Hadithi sont choisis pour ce qu'ils ont vécu et compris de l'intérieur."
      />

      <PageHeader
        tone="auteurs"
        eyebrow="Auteurs"
        title="Nos auteurs"
        intro=""
      />
      <section className="intro">
        <div className="container-editorial pt-20 py-10">
          <p className="text-[20px] leading-[30px] sm:text-[25px] sm:leading-[35px]">
            Nos auteurs ne sont pas choisis pour leur titre, mais pour ce qu'ils ont vécu et compris de l'intérieur. Décideurs, diplomates, entrepreneurs, figures politiques, praticiens du changement : chacun porte une trajectoire qui éclaire le monde qui vient.
          </p>
        </div>
      </section>
      <section className="bg-background">
        <div className="container-editorial py-10 pb-25">
          {status === "idle" || status === "loading" ? (
            <p className="text-lg">Chargement…</p>
          ) : status === "failed" ? (
            <p className="text-lg">Impossible de charger les auteurs pour le moment.</p>
          ) : authors.length === 0 ? (
            <p className="text-lg">Aucun auteur à afficher.</p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {authors.map((a, i) => (
                <Reveal key={a.slug} delay={i * 80}>
                  <Link
                    to={`/auteurs/${a.slug}`}
                    className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-soft"
                  >
                    <PlaceholderPhoto
                      className="aspect-[3/4]"
                      imgClassName=""
                      src={a.img_url || authorFallback.src}
                      alt={a.name}
                    />
                    <div className="mt-5 flex items-center gap-3">
                      <h2 className="text-balance-tight text-lg">{a.name}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground text-black">{a.role}</p>
                    <div className="mt-5">
                      <button className={`${buttonStyles.outline} cursor-pointer`}>
                        Voir la fiche
                      </button>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}