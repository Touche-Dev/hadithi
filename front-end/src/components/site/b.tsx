import { Link } from "react-router-dom";
import { Logo } from "./ui";
import { Newsletter } from "./Newsletter";
import { contact, legalNotice } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="container-editorial grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="h-10 py-1">
            <Logo variant="white" className="h-full" />
          </div>
          <p className="editorial-quote mt-8 text-2xl text-cream/90">
            Hadithi. Les récits qui transforment.
          </p>
        </div>

        <nav aria-label="Navigation du site">
          <h2 className="eyebrow mb-5 text-light-blue">Navigation</h2>
          <ul className="space-y-3 text-sm text-cream/80">
            <li>
              <Link to="/livres" className="link-underline">
                Livres
              </Link>
            </li>
            <li>
              <Link to="/auteurs" className="link-underline">
                Auteurs
              </Link>
            </li>
            <li>
              <Link to="/events" className="link-underline">
                Events
              </Link>
            </li>
            <li>
              <Link to="/soumettre-un-manuscrit" className="link-underline">
                Soumettre un manuscrit
              </Link>
            </li>
            <li>
              <Link to="/a-propos" className="link-underline">
                À propos
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="À propos">
          <h2 className="eyebrow mb-5 text-light-blue">À propos</h2>
          <ul className="space-y-3 text-sm text-cream/80">
            <li>
              <Link to="/a-propos#notre-maison" className="link-underline">
                Notre Maison
              </Link>
            </li>
            <li>
              <Link to="/a-propos#collections" className="link-underline">
                Collections
              </Link>
            </li>
            <li>
              <Link to="/a-propos#notre-modele" className="link-underline">
                Notre modèle
              </Link>
            </li>
            <li>
              <Link to="/a-propos#nos-metiers" className="link-underline">
                Nos métiers
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-5 text-light-blue">Contact &amp; réseaux</h2>
          <address className="space-y-3 text-sm not-italic text-cream/80">
            <p>{contact.address}</p>
            <p>
              <a href={`mailto:${contact.email}`} className="link-underline">
                {contact.email}
              </a>
            </p>
            <p>
              <a
                href={contact.linkedin}
                className="link-underline"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
              {" · "}
              <a
                href={contact.instagram}
                className="link-underline"
                rel="noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="container-editorial grid gap-8 py-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-xl font-extrabold">Ne manquez aucun récit.</h2>
            <p className="mt-2 max-w-md text-sm text-cream/70">
              Nos parutions, nos rencontres d'auteurs et nos coulisses éditoriales, une à deux fois
              par mois.
            </p>
          </div>
          <Newsletter variant="navy" />
        </div>
      </div>

      <div className="border-t border-cream/15">
        <p className="container-editorial py-8 text-xs leading-relaxed text-cream/55">
          {legalNotice}
        </p>
      </div>
    </footer>
  );
}
