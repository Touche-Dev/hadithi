/**
 * Source de contenu du site Hadithi Publishers.
 * Les entrées marquées `demo: true` sont des placeholders de démonstration,
 * à remplacer par le catalogue réel avant mise en ligne.
 */
import legacy from "../assets/legacy.webp";
import visionMonde from "../assets/vision-du-monde.webp";
import kids from "../assets/kids.webp";
export type CollectionId = "legacy" | "visions" | "kids";

export type Collection = {
  id: CollectionId;
  name: string;
  tagline: string;
  description: string;
  /** classes de badge (tokens du design system) */
  badge: string;
  swatch: string;
  alt: string;
  src?: string;
};

export const collections: Record<CollectionId, Collection> = {
  legacy: {
    id: "legacy",
    name: "Legacy",
    tagline: "Les mémoires et trajectoires qui marquent une génération.",
    description:
      "Format grand format, 180-240 pages. Cette collection réunit les récits de vie de décideurs, diplomates, activistes, entrepreneurs et figures politiques qui ont traversé l'adversité ou porté une idée jusqu'à la transformer en réalité. Legacy est notre collection fondatrice , celle du témoignage direct, écrit ou co-écrit avec ceux qui l'ont vécu.",
    badge: "bg-legacy text-navy",
    swatch: "bg-legacy",
    alt: "Couverture du livre Legacy",
    src: legacy
  },
  visions: {
    id: "visions",
    name: "Visions du Monde",
    tagline: "Les essais qui décryptent les grandes transformations économiques et politiques.",
    description:
      "Format grand format, 220-280 pages. Cette collection traite des dynamiques de transformation du monde , modèles économiques émergents, gouvernance et institutions, relations internationales. Elle s'adresse à un lecteur cultivé, non spécialiste, qui veut comprendre les recompositions du monde contemporain sans sacrifier la rigueur analytique.",
    badge: "bg-visions text-cream",
    swatch: "bg-visions",
    alt: "Couverture du livre Visions du Monde",
    src: visionMonde
  },
  kids: {
    id: "kids",
    name: "Kids",
    tagline: "Les récits inspirants transmis aux plus jeunes lecteurs.",
    description:
      "Une collection dédiée à la transmission : des versions adaptées de trajectoires inspirantes, pensées pour donner aux jeunes lecteurs des figures et des histoires vraies auxquelles se rattacher , dans l'esprit du conteur qui donne sens à une communauté par le récit.",
    badge: "bg-kids text-navy",
    swatch: "bg-kids",
    alt: "Couverture du livre Kids",
    src: kids
  },
};

export const collectionList = Object.values(collections);

export const formats = ["Essai", "Mémoires & Trajectoires", "Cahiers", "Hors-série"] as const;

export const themes = [
  "Économie & développement",
  "Gouvernance & institutions",
  "Relations internationales",
  "Mémoires",
  "Jeunesse",
  "Récit",
] as const;

export const availabilities = ["Nouveauté", "Catalogue", "À paraître"] as const;

export type Book = {
  coverSrc?: string;
  slug: string;
  title: string;
  authorSlug: string;
  collection: CollectionId;
  format: (typeof formats)[number];
  theme: (typeof themes)[number];
  availability: (typeof availabilities)[number];
  price: string;
  pages: string;
  isbn: string;
  publishedAt: string;
  coverTone: "navy" | "warm" | "blue" | "cream";
  demo: boolean;
  excerptPdfUrl:string;
  history:string;
  why:string;
};

export type Author = {
  slug: string;
  name: string;
  img:string;
  role: string;
  bio: string;
  links?: { label: string; href: string }[];
  demo: boolean;
};

export type SiteEvent = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  city: string;
  venue: string;
  type: "Lancement" | "Salon" | "Conférence" | "Dédicace";
  description: string;
  authorSlugs: string[];
  bookSlugs: string[];
  practical: string;
  past: boolean;
  demo: boolean;
};

export const authors: Author[] = [
  {
    slug: "auteur-a-confirmer-1",
    name: "Auteur à confirmer",
    img:"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&fm=webp&q=70&w=900&sat=-25&h=1200",
    role: "Ancien diplomate",
    bio: "Emplacement de démonstration. La biographie longue (200 à 300 mots, orientée trajectoire et expérience de terrain plutôt que titres académiques) sera renseignée à la publication de la fiche.",
    demo: false,
  },
  {
    slug: "auteur-a-confirmer-2",
    name: "Autrice à confirmer",
    img:"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&fm=webp&q=70&w=900&sat=-25&h=1200",
    role: "Entrepreneure",
    bio: "Emplacement de démonstration. La biographie longue (200 à 300 mots, orientée trajectoire et expérience de terrain plutôt que titres académiques) sera renseignée à la publication de la fiche.",
    demo: false,
  },
  {
    slug: "auteur-a-confirmer-3",
    name: "Auteur à confirmer",
    img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&fm=webp&q=70&w=900&sat=-25&h=1200",
    role: "Figure politique",
    bio: "Emplacement de démonstration. La biographie longue (200 à 300 mots, orientée trajectoire et expérience de terrain plutôt que titres académiques) sera renseignée à la publication de la fiche.",
    demo: false,
  },
  {
    slug: "auteur-a-confirmer-4",
    name: "Autrice à confirmer",
    img:"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&fm=webp&q=70&w=900&sat=-25&h=1200",
    role: "Praticienne du changement",
    bio: "Emplacement de démonstration. La biographie longue (200 à 300 mots, orientée trajectoire et expérience de terrain plutôt que titres académiques) sera renseignée à la publication de la fiche.",
    demo: false,
  },
];

export const books: Book[] = [
  {
    coverSrc: "https://anaiscros.fr/wp-content/uploads/2021/09/Loeil-du-tueur_livre_V2_web.jpg",
    slug: "titre-a-venir-1",
    title: "Titre à venir",
    authorSlug: "auteur-a-confirmer-1",
    collection: "legacy",
    format: "Mémoires & Trajectoires",
    theme: "Mémoires",
    availability: "À paraître",
    price: "19,90 €",
    pages: "Grand format, 180-240 pages",
    isbn: "978-2-XXXXX-XX-X",
    publishedAt: "À paraître",
    coverTone: "navy",
    demo: true,
    excerptPdfUrl:"/extraits/pdf-exemple.pdf",
    history:"Emplacement éditorial — résumé de 150 à 200 mots, ton immersif, posant l'enjeu humain avant l'enjeu thématique. À renseigner avant mise en ligne.",
    why:"Emplacement éditorial — 3 à 4 lignes sur la portée du sujet, la dimension terrain de l'auteur et ce que le lecteur en retient.",
  },
  {
    coverSrc: "https://design-assets.adobeprojectm.com/content/download/express/public/urn:aaid:sc:VA6C2:549b15a7-c0a8-5da2-9de5-114cde139a82/component?assetType=TEMPLATE&etag=3a81385f8a36437195ab3d7af58205e4&revision=d35f25b8-f6f3-446c-b00a-4738db0c64b6&component_id=6774bdc5-02d2-46c3-86f0-57c235ec8719",
    slug: "titre-a-venir-2",
    title: "Titre à venir",
    authorSlug: "auteur-a-confirmer-2",
    collection: "visions",
    format: "Essai",
    theme: "Économie & développement",
    availability: "Nouveauté",
    price: "19,90 €",
    pages: "Grand format, 220-280 pages",
    isbn: "978-2-XXXXX-XX-X",
    publishedAt: "À paraître",
    coverTone: "blue",
    demo: true,
    excerptPdfUrl:"/extraits/pdf-exemple.pdf",
    history:"Emplacement éditorial — résumé de 150 à 200 mots, ton immersif, posant l'enjeu humain avant l'enjeu thématique. À renseigner avant mise en ligne.",
    why:"Emplacement éditorial — 3 à 4 lignes sur la portée du sujet, la dimension terrain de l'auteur et ce que le lecteur en retient.",
  },
  {
    coverSrc: "https://i.pinimg.com/236x/9e/e3/65/9ee36505b4e2a74c5e42b1d8f6f3dbad.jpg",
    slug: "titre-a-venir-3",
    title: "Titre à venir",
    authorSlug: "auteur-a-confirmer-3",
    collection: "legacy",
    format: "Mémoires & Trajectoires",
    theme: "Gouvernance & institutions",
    availability: "Catalogue",
    price: "19,90 €",
    pages: "Grand format, 180-240 pages",
    isbn: "978-2-XXXXX-XX-X",
    publishedAt: "À paraître",
    coverTone: "warm",
    demo: true,
    excerptPdfUrl:"/extraits/pdf-exemple.pdf",
    history:"Emplacement éditorial — résumé de 150 à 200 mots, ton immersif, posant l'enjeu humain avant l'enjeu thématique. À renseigner avant mise en ligne.",
    why:"Emplacement éditorial — 3 à 4 lignes sur la portée du sujet, la dimension terrain de l'auteur et ce que le lecteur en retient.",
  },
  {
    coverSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToQkbg6b2NbMnvZmoFkZv4EGeHeyFL2l7MkMVd8MSH3Q&s=10",
    slug: "titre-a-venir-4",
    title: "Titre à venir",
    authorSlug: "auteur-a-confirmer-4",
    collection: "visions",
    format: "Cahiers",
    theme: "Relations internationales",
    availability: "À paraître",
    price: "19,90 €",
    pages: "Grand format, 220-280 pages",
    isbn: "978-2-XXXXX-XX-X",
    publishedAt: "À paraître",
    coverTone: "cream",
    demo: true,
    excerptPdfUrl:"/extraits/pdf-exemple.pdf",
    history:"Emplacement éditorial — résumé de 150 à 200 mots, ton immersif, posant l'enjeu humain avant l'enjeu thématique. À renseigner avant mise en ligne.",
    why:"Emplacement éditorial — 3 à 4 lignes sur la portée du sujet, la dimension terrain de l'auteur et ce que le lecteur en retient.",
  },
  
];

export const events: SiteEvent[] = [
  {
    slug: "rencontre-auteur-paris",
    title: "Rencontre auteur — à venir",
    date: "2026-10-15",
    dateLabel: "15 octobre 2026",
    city: "Paris",
    venue: "Lieu à confirmer",
    type: "Lancement",
    description:
      "Emplacement de démonstration. La description de l'événement (contexte, partenaires, programme) sera renseignée dès la confirmation de la date et du lieu.",
    authorSlugs: ["auteur-a-confirmer-1"],
    bookSlugs: ["titre-a-venir-1","titre-a-venir-2","titre-a-venir-3"],
    practical: "Accès, inscription et vente sur place : informations à confirmer.",
    past: false,
    demo: false,
  },
  {
    slug: "rencontre-auteur-dakar",
    title: "Rencontre auteur — à venir",
    date: "2026-11-08",
    dateLabel: "8 novembre 2026",
    city: "Dakar",
    venue: "Lieu à confirmer",
    type: "Conférence",
    description:
      "Emplacement de démonstration. La description de l'événement (contexte, partenaires, programme) sera renseignée dès la confirmation de la date et du lieu.",
    authorSlugs: ["auteur-a-confirmer-2"],
    bookSlugs: ["titre-a-venir-2"],
    practical: "Accès, inscription et vente sur place : informations à confirmer.",
    past: false,
    demo: false,
  },
  {
    slug: "rencontre-auteur-abidjan",
    title: "Rencontre auteur — à venir",
    date: "2026-06-12",
    dateLabel: "12 juin 2026",
    city: "Abidjan",
    venue: "Lieu à confirmer",
    type: "Dédicace",
    description:
      "Emplacement de démonstration. Le compte-rendu et la galerie photo de l'événement seront ajoutés ici après la rencontre.",
    authorSlugs: ["auteur-a-confirmer-3"],
    bookSlugs: ["titre-a-venir-3"],
    practical: "Archive — vente sur place assurée par l'équipe Hadithi.",
    past: true,
    demo: false,
  },
];

export const getBook = (slug: string) => books.find((b) => b.slug === slug);
export const getAuthor = (slug: string) => authors.find((a) => a.slug === slug);
export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
export const booksByAuthor = (slug: string) => books.filter((b) => b.authorSlug === slug);
export const eventsByAuthor = (slug: string) => events.filter((e) => e.authorSlugs.includes(slug));
export const eventsByBook = (slug: string) => events.filter((e) => e.bookSlugs.includes(slug));
export const relatedBooks = (book: Book) =>
  books.filter((b) => b.slug !== book.slug && b.collection === book.collection).slice(0, 3);

export const contact = {
  email: "contact@hadithipublishers.com",
  address: "12 rue de la Réunion, 75020 Paris, France",
  linkedin: "https://linkedin.com/company/hadithi-publishers",
  instagram: "https://instagram.com/hadithipublishers",
};

export const legalNotice =
  "Hadithi Publishers — SAS au capital de 10 000 € — Siège social : 12 rue de la Réunion, 75020 Paris, France — RCS Paris [XXX XXX XXX] — Code APE 58.11Z – Édition de livres — Directeur de la publication : [Nom Prénom] — Hébergeur : [Nom de l'hébergeur, adresse] — © Hadithi Publishers, 2026. Tous droits réservés.";
