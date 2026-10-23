import type { AcademyStatus, ManuscriptGenre, ManuscriptStatus, EventType } from "@/types";

export const MANUSCRIPT_STATUSES: { value: ManuscriptStatus; label: string }[] = [
  { value: "recu", label: "Reçu" },
  { value: "accuse_envoye", label: "Accusé envoyé" },
  { value: "en_lecture", label: "En lecture" },
  { value: "en_comite", label: "En comité" },
  { value: "accepte", label: "Accepté" },
  { value: "refuse", label: "Refusé" },
  { value: "a_retravailler", label: "À retravailler" },
];

export const manuscriptStatusLabel = (s: ManuscriptStatus) =>
  MANUSCRIPT_STATUSES.find((x) => x.value === s)?.label ?? s;

export const GENRES: ManuscriptGenre[] = ["Essai", "Mémoires", "Récit politique", "Histoire de vie"];

export const WORKSHOPS = [
  "Structurer un récit de vie",
  "Passer du témoignage oral au manuscrit",
  "Construire un essai à partir d'une expérience de terrain",
];

export const ACADEMY_STATUSES: { value: AcademyStatus; label: string }[] = [
  { value: "nouvelle", label: "Nouvelle" },
  { value: "contactee", label: "Contactée" },
  { value: "inscrit", label: "Inscrite" },
  { value: "refusee", label: "Refusée" },
];

export const EVENT_TYPES: EventType[] = ["Lancement", "Salon", "Conférence", "Dédicace"];

export const SOURCES = [
  { value: "manuscrit", label: "Manuscrit" },
  { value: "book_club", label: "Book Club" },
  { value: "academy", label: "Academy" },
  { value: "evenement", label: "Événement" },
] as const;
export type Source = (typeof SOURCES)[number]["value"];

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
