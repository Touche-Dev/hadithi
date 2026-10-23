import { Link } from "react-router-dom";
import { Logo } from "./ui";
import { Newsletter } from "./Newsletter";
import { contact, legalNotice } from "@/lib/content";
import { CiInstagram, CiLinkedin } from "react-icons/ci";


export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="container-editorial grid gap-12 py-20 pb-10 text-center sm:text-left md:grid-cols-2 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="h-15 py-1 flex justify-center sm:justify-start">
            <Logo variant="white" className="h-full" />
          </div>
          <p className="editorial-quote mt-2 text-2xl text-cream/90">
            Hadithi. Les récits qui transforment.
          </p>
          <p className="mt-2">{contact.address}</p>
        </div>

        <nav aria-label="Navigation du site">
          <h2 className="eyebrow mb-5 text-white text-[13px] font-[700] tracking-[0.46px]">Navigation</h2>
          <ul className="space-y-3 text-sm text-cream">
            <li>
              <Link to="/livres" className="">
                Livres
              </Link>
            </li>
            <li>
              <Link to="/auteurs" className="hover:text-cream/100">
                Auteurs
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-cream/100">
                Events
              </Link>
            </li>
            <li>
              <Link to="/soumettre-un-manuscrit" className="hover:text-cream/100">
                Soumettre un manuscrit
              </Link>
            </li>
            <li>
              <Link to="/a-propos" className="hover:text-cream/100">
                À propos
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="À propos">
          <h2 className="eyebrow mb-5 text-white text-[13px] font-[700] tracking-[0.46px]">À propos</h2>
          <ul className="space-y-3 text-sm text-cream">
            <li>
              <Link to="/a-propos#notre-maison" className="hover:text-cream/100">
                Notre Maison
              </Link>
            </li>
            <li>
              <Link to="/a-propos#collections" className="hover:text-cream/100">
                Collections
              </Link>
            </li>
            <li>
              <Link to="/a-propos#notre-modele" className="hover:text-cream/100">
                Notre modèle
              </Link>
            </li>
            <li>
              <Link to="/a-propos#nos-metiers" className="hover:text-cream/100">
                Nos métiers
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-5 text-white text-[13px] font-[700] tracking-[0.46px]">Contact</h2>
          <address className="space-y-3 text-sm not-italic text-cream">

            <p>
              <a href={`mailto:${contact.email}`} className="hover:text-cream/100">
                {contact.email}
              </a>
            </p>
            <p className="flex items-center justify-center gap-1 text-[30px] sm:justify-start">
              <a
                href={contact.linkedin}
                className="hover:text-cream/100"
                rel="noreferrer"
                target="_blank"
              >
                <CiLinkedin />
              </a>
              <a
                href={contact.instagram}
                className="hover:text-cream/100"
                rel="noreferrer"
                target="_blank"
              >
                <CiInstagram />
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="container-editorial">
        <div className="border-t border-cream/20" />
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-xs leading-relaxed text-cream md:flex-row md:items-center md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} Hadithi Publishers. Tous droits réservés.</p>
          <a href="/mentions-legales" className="hover:text-cream transition-colors">
            Mentions légales
          </a>
        </div>
      </div>
    </footer>
  );
}


/*


import { Link } from "react-router-dom";
import { Logo } from "./ui";
import { Newsletter } from "./Newsletter";
import { contact, legalNotice } from "@/lib/content";
import { CiInstagram,CiLinkedin } from "react-icons/ci";


export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="container-editorial grid gap-12 py-20 pb-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="h-15 py-1">
            <Logo variant="white" className="h-full" />
          </div>
          <p className="editorial-quote mt-2 text-2xl text-cream/90">
            Hadithi. Les récits qui transforment.
          </p>
          <p className="mt-2">{contact.address}</p>
        </div>

        <nav aria-label="Navigation du site">
          <h2 className="eyebrow mb-5 text-white text-[13px] font-[700] tracking-[0.46px]">Navigation</h2>
          <ul className="space-y-3 text-sm text-cream/80">
            <li>
              <Link to="/livres" className="">
                Livres
              </Link>
            </li>
            <li>
              <Link to="/auteurs" className="hover:text-cream/100">
                Auteurs
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-cream/100">
                Events
              </Link>
            </li>
            <li>
              <Link to="/soumettre-un-manuscrit" className="hover:text-cream/100">
                Soumettre un manuscrit
              </Link>
            </li>
            <li>
              <Link to="/a-propos" className="hover:text-cream/100">
                À propos
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="À propos">
          <h2 className="eyebrow mb-5 text-white text-[13px] font-[700] tracking-[0.46px]">À propos</h2>
          <ul className="space-y-3 text-sm text-cream/80">
            <li>
              <Link to="/a-propos#notre-maison" className="hover:text-cream/100">
                Notre Maison
              </Link>
            </li>
            <li>
              <Link to="/a-propos#collections" className="hover:text-cream/100">
                Collections
              </Link>
            </li>
            <li>
              <Link to="/a-propos#notre-modele" className="hover:text-cream/100">
                Notre modèle
              </Link>
            </li>
            <li>
              <Link to="/a-propos#nos-metiers" className="hover:text-cream/100">
                Nos métiers
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-5 text-white text-[13px] font-[700] tracking-[0.46px]">Contact &amp; réseaux</h2>
          <address className="space-y-3 text-sm not-italic text-cream/80">
            
            <p>
              <a href={`mailto:${contact.email}`} className="hover:text-cream/100">
                {contact.email}
              </a>
            </p>
            <p className="flex items-center gap-1 text-[30px]">
              <a
                href={contact.linkedin}
                className="hover:text-cream/100"
                rel="noreferrer"
                target="_blank"
              >
                <CiLinkedin />
              </a>
              <a
                href={contact.instagram}
                className="hover:text-cream/100"
                rel="noreferrer"
                target="_blank"
              >
                <CiInstagram />
              </a>
            </p>
          </address>
        </div>
      </div>
      
      <div className="container-editorial">
        <div className="border-t border-cream/20" />
        <div className="py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs leading-relaxed text-cream/55">
          <p>© {new Date().getFullYear()} Hadithi Publishers. Tous droits réservés.</p>
          <a href="/mentions-legales" className="hover:text-cream/80 transition-colors">
            Mentions légales
          </a>
        </div>
      </div>
    </footer>
  );
}
*/