export type ManuscriptStatus =
  | "recu"
  | "accuse_envoye"
  | "en_lecture"
  | "en_comite"
  | "accepte"
  | "refuse"
  | "a_retravailler";

export type ManuscriptGenre = "Essai" | "Mémoires" | "Récit politique" | "Histoire de vie";
export type AcademyStatus = "nouvelle" | "contactee" | "inscrit" | "refusee";
export type EventType = "Lancement" | "Salon" | "Conférence" | "Dédicace";

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  tags: string[];
  notes: string | null;
  consent_at: string | null;
  unsubscribed: 0 | 1;
  created_at: string;
}

export interface StatusChange {
  status: ManuscriptStatus;
  at: string;
}

export interface Manuscript {
  id: number;
  contact_id: number;
  title: string;
  genre: ManuscriptGenre;
  summary: string;
  author_bio: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  status: ManuscriptStatus;
  reading_notes: string | null;
  decision_note: string | null;
  received_at: string;
  answered_at: string | null;
  status_history: StatusChange[];
}

export interface BookClubMember {
  id: number;
  contact_id: number;
  collection_id: string | null;
  created_at: string;
}

export interface AcademyRequest {
  id: number;
  contact_id: number;
  workshop: string;
  project: string;
  status: AcademyStatus;
  created_at: string;
}

export interface EventRegistration {
  id: number;
  event_slug: string;
  contact_id: number;
  seats: number;
  attended: 0 | 1;
  created_at: string;
}

export interface CrmEvent {
  id: number;
  slug: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  type: EventType;
  description: string;
  practical_info: string;
  img_url: string | null;
  capacity: number | null;
  published: 0 | 1;
  author_ids: number[];
  book_ids: number[];
}

export interface Author {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author_id: number | null;
}

export interface Collection {
  id: string;
  name: string;
}

export interface Stats {
  manuscripts_todo: number;
  manuscripts_reading: number;
  manuscripts_late: number;
  new_requests_7d: number;
  book_club_month: number;
  academy_month: number;
}

export interface AdminUser {
  id: number;
  email: string;
  last_login_at: string | null;
}
