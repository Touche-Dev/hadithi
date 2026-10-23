import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, buttonStyles } from "./ui";

const nav = [
  { to: "/livres", label: "Livres" },
  { to: "/auteurs", label: "Auteurs" },
  { to: "/events", label: "Events" },
] as const;

const aboutLinks = [
  { to: "/a-propos#notre-maison", label: "Notre Maison" },
  { to: "/a-propos#collections", label: "Collections" },
  { to: "/a-propos#notre-modele", label: "Notre modèle" },
  { to: "/a-propos#nos-metiers", label: "Nos métiers" },
  { to: "/a-propos#book-club", label: "Book Club" },
  { to: "/a-propos#academy", label: "Academy" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const { pathname, hash } = useLocation();

  const closeMenu = () => {
    setOpen(false);
    setMobileAboutOpen(false);
  };

  useEffect(() => {
    setOpen(false);
    setAboutOpen(false);
    setMobileAboutOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le dropdown au clic extérieur ou avec Échap
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) setAboutOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAboutOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const aboutActive = pathname.startsWith("/a-propos");

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-500 ease-out py-3 ${scrolled
            ? "border-navy/10 bg-white shadow-[0_10px_30px_-24px_rgba(5,24,46,0.6)] backdrop-blur-xl"
            : "border-transparent bg-transparent backdrop-blur-md"
          }`}
      >
        <div className="container-editorial grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 lg:flex lg:justify-between py-3">
          <Link to="/" className="shrink-0 py-1 h-15" aria-label="Hadithi Publishers, accueil">
            <Logo className="h-full" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm uppercase text-navy/80 transition-colors font-medium hover:text-navy text-[15px]",
                    isActive && "text-navy font-semibold",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Dropdown À propos */}
            <div
              ref={aboutRef}
              className="relative"
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}
            >
              <Link
                to="/a-propos"
                onClick={() => setAboutOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={aboutOpen}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm uppercase text-navy/80 transition-colors font-medium hover:text-navy text-[15px] cursor-pointer",
                  aboutActive && "text-navy font-semibold",
                )}
              >
                À propos
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-300", aboutOpen && "rotate-180")}
                />
              </Link>

              <div
                role="menu"
                className={cn(
                  "absolute left-1/2 top-full w-64 -translate-x-1/2 pt-10 transition-all duration-200",
                  aboutOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0",
                )}
              >
                <div className="overflow-hidden rounded-sm border border-navy/10 bg-white shadow-[0_20px_40px_-20px_rgba(5,24,46,0.35)]">
                  <ul className="py-0">
                    {aboutLinks.map((l) => (
                      <li key={l.to}>
                        <Link
                          to={l.to}
                          role="menuitem"
                          onClick={() => setAboutOpen(false)}
                          className="block pl-6 border-b-1 border-navy/30 py-3 text-[15px] text-navy/80 hover:bg-navy/10 hover:text-navy"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </nav>

          <Link to="/soumettre-un-manuscrit" className={`${buttonStyles.solid} hidden lg:inline-flex`}>
            Soumettre un manuscrit
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-navy/20 text-navy lg:hidden cursor-pointer"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy text-cream lg:hidden">
          {/* Barre du haut */}
          <div className="container-editorial flex shrink-0 items-center justify-between border-b border-cream/10 py-4">
            <Link to="/" onClick={closeMenu} className="h-12 py-1" aria-label="Accueil">
              <Logo variant="white" className="h-full" />
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-cream/25"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Liens (zone scrollable) */}
          <nav
            className="container-editorial flex-1 overflow-y-auto py-4"
            aria-label="Navigation mobile"
          >
            <ul className="divide-y divide-cream/10">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      cn(
                        "block py-5 font-display text-2xl font-extrabold tracking-tight transition-colors",
                        isActive ? "text-cream" : "text-cream/70 hover:text-cream",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}

              {/* À propos en accordéon */}
              <li>
                <div className="flex items-center justify-between">
                  <Link
                    to="/a-propos"
                    onClick={closeMenu}
                    className={cn(
                      "flex-1 py-5 font-display text-2xl font-extrabold tracking-tight transition-colors",
                      aboutActive ? "text-cream" : "text-cream/70 hover:text-cream",
                    )}
                  >
                    À propos
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileAboutOpen((v) => !v)}
                    aria-expanded={mobileAboutOpen}
                    aria-label="Afficher les sous-sections de À propos"
                    className="inline-flex h-10 w-10 items-center justify-center text-cream/70"
                  >
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        mobileAboutOpen && "rotate-180",
                      )}
                    />
                  </button>
                </div>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    mobileAboutOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <ul className="pl-4">
                      {aboutLinks.map((l, i) => (
                        <li
                          key={l.to}
                          className={cn(
                            "border-b border-cream/10",
                            i === aboutLinks.length - 1 && "border-b-0",
                          )}
                        >
                          <Link
                            to={l.to}
                            onClick={closeMenu}
                            className="block py-3 text-lg text-cream/80 hover:text-cream"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          {/* Bouton fixe en bas */}
          <div className="container-editorial shrink-0 border-t border-cream/10 py-5">
            <Link
              to="/soumettre-un-manuscrit"
              onClick={closeMenu}
              className={`${buttonStyles.onNavy} flex w-full justify-center`}
            >
              Soumettre un manuscrit
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}