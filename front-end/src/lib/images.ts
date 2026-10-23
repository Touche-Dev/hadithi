/**
 * Visuels temporaires — photographies libres de droit (Unsplash License,
 * usage commercial autorisé, sans attribution obligatoire).
 * Toutes ces images sont des PLACEHOLDERS : chaque <img> qui les utilise
 * porte l'attribut data-placeholder="true" pour un remplacement facile
 * par les visuels définitifs.
 */

import bgLivres from "@/assets/bg/bg-livres.webp"
import bgAuteurs from "@/assets/bg/bg-auteurs.webp"

type Opts = { w?: number; h?: number; sat?: number };

/** Construit une URL Unsplash optimisée (WebP, recadrage, désaturation légère). */
export function stock(id: string, { w = 1200, h, sat = -25 }: Opts = {}) {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    fm: "webp",
    q: "70",
    w: String(w),
    sat: String(sat),
  });
  if (h) params.set("h", String(h));
  return `https://images.unsplash.com/${id}?${params.toString()}`;
}

export const heroImage = {
  src: stock("photo-1481627834876-b7833e8f5570", { w: 1920, h: 1200, sat: -35 }),
  alt: "Rayonnages d'une bibliothèque feutrée éclairée par une lumière chaude",
};

export const authorPhotos: Record<string, { src: string; alt: string }> = {
  "auteur-a-confirmer-1": {
    src: stock("photo-1560250097-0b93528c311a", { w: 900, h: 1200 }),
    alt: "Portrait professionnel en buste, homme en costume sur fond sobre",
  },
  "auteur-a-confirmer-2": {
    src: stock("photo-1573497019940-1c28c88b4f3e", { w: 900, h: 1200 }),
    alt: "Portrait professionnel en buste, femme en tenue de travail sur fond neutre",
  },
  "auteur-a-confirmer-3": {
    src: stock("photo-1507003211169-0a1dd7228f2d", { w: 900, h: 1200 }),
    alt: "Portrait en buste d'un homme au regard posé, fond sombre et sobre",
  },
  "auteur-a-confirmer-4": {
    src: stock("photo-1580489944761-15a19d654956", { w: 900, h: 1200 }),
    alt: "Portrait en buste d'une femme sur fond clair et neutre",
  },
};

export const authorFallback = {
  src: stock("photo-1531590878845-12627191e687", { w: 900, h: 1200 }),
  alt: "Portrait professionnel neutre en buste",
};

export const eventPhotos: Record<string, { src: string; alt: string }> = {
  "rencontre-auteur-paris": {
    src: stock("photo-1540575467063-178a50c2df87", { w: 1400, h: 900 }),
    alt: "Salle de conférence institutionnelle avec une prise de parole en tribune",
  },
  "rencontre-auteur-dakar": {
    src: stock("photo-1475721027785-f74eccf877e2", { w: 1400, h: 900 }),
    alt: "Public attentif lors d'une rencontre publique",
  },
  "rencontre-auteur-abidjan": {
    src: stock("photo-1505664194779-8beaceb93744", { w: 1400, h: 900 }),
    alt: "Intervenant s'adressant à une audience lors d'une conférence",
  },
};

export const eventFallback = {
  src: stock("photo-1505664194779-8beaceb93744", { w: 1400, h: 900 }),
  alt: "Rencontre publique dans un cadre institutionnel",
};

export const editorialImages = {
  manuscrit: {
    src: stock("photo-1516979187457-637abb4f9353", { w: 1200, h: 800 }),
    alt: "Manuscrit annoté posé sur un bureau de travail",
  },
  correction: {
    src: stock("photo-1524995997946-a1c2e315a42f", { w: 1200, h: 800 }),
    alt: "Relecture d'un texte, stylo à la main",
  },
  fabrication: {
    src: stock("photo-1544716278-ca5e3f4abd8c", { w: 1200, h: 800 }),
    alt: "Piles d'ouvrages imprimés, étape de fabrication",
  },
  librairie: {
    src: stock("photo-1521587760476-6c12a4b040da", { w: 1200, h: 800 }),
    alt: "Rayonnage de librairie indépendante",
  },
};

/** Photos de fond des bannières de page (sous le dégradé de marque). */
export const bannerPhotos = {
  livres: {
    src: bgLivres,
    alt: "Rayonnages d'une bibliothèque en lumière douce",
  },
  auteurs: {
    src: bgAuteurs,
    alt: "Bureau d'écrivain, main en train d'écrire dans un carnet",
  },
  events: {
    src: stock("photo-1540575467063-178a50c2df87", { w: 1920, h: 700, sat: -40 }),
    alt: "Salle de conférence avec public lors d'une prise de parole",
  },
  manuscrit: {
    src: stock("photo-1516979187457-637abb4f9353", { w: 1920, h: 700, sat: -40 }),
    alt: "Pages manuscrites annotées sur un bureau d'écriture",
  },
  apropos: {
    src: stock("photo-1521587760476-6c12a4b040da", { w: 1920, h: 700, sat: -40 }),
    alt: "Atelier d'édition et rayonnages d'ouvrages",
  },
} as const;
