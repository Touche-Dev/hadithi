/**
 * Accès à l'API du CRM (/api/admin/*).
 * Version 100 % backend : plus aucune dépendance à ./mock.js.
 *
 * Le contrat attendu de chaque route est décrit dans le message d'accompagnement.
 * Les erreurs métier doivent renvoyer un JSON { "message": "..." } : ce message
 * devient `error.message` côté interface (ex. « Ce slug est déjà utilisé. »).
 * `error.response.status` reste disponible (401, 429, …).
 */
import client from "./client";

/** Exécute une requête axios, renvoie `data`, et remonte le message du backend. */
const call = (request) =>
  request
    .then((r) => r.data)
    .catch((err) => {
      const msg = err?.response?.data?.message;
      if (msg) err.message = msg;
      throw err;
    });

/* ---------- Auth ---------- */
// POST /api/admin/login → { token, user }
export const login = (email, password) =>
  call(client.post("/api/admin/login", { email, password }));

// GET /api/admin/me → user
export const me = () => call(client.get("/api/admin/me"));

// PATCH /api/admin/me/password  { current, next } → { ok: true }
export const changePassword = (current, next) =>
  call(client.patch("/api/admin/me/password", { current, next }));

/* ---------- Stats ---------- */
// GET /api/admin/stats → { manuscripts_todo, manuscripts_reading, manuscripts_late,
//                          new_requests_7d, book_club_month, academy_month }
export const getStats = () => call(client.get("/api/admin/stats"));

/* ---------- Contacts ---------- */
export const listContacts = () => call(client.get("/api/admin/contacts"));
export const updateContact = (id, patch) =>
  call(client.patch(`/api/admin/contacts/${id}`, patch));
// POST /api/admin/contacts/merge  { keepId, removeId } → contact conservé
export const mergeContacts = (keepId, removeId) =>
  call(client.post("/api/admin/contacts/merge", { keepId, removeId }));

/* ---------- Manuscrits ---------- */
export const createManuscript = (input) =>
  call(client.post("/api/admin/manuscripts", input));
export const listManuscripts = () => call(client.get("/api/admin/manuscripts"));
export const updateManuscript = (id, patch) =>
  call(client.patch(`/api/admin/manuscripts/${id}`, patch));
// PATCH /api/admin/manuscripts/:id/status  { status }
export const updateManuscriptStatus = (id, status) =>
  call(client.patch(`/api/admin/manuscripts/${id}/status`, { status }));
// POST /api/admin/manuscripts/:id/convert-to-book  { collection_id, format, theme, cover_url?, cover_tone?, price_cents?, isbn? }
export const convertManuscriptToBook = (id, input) =>
  call(client.post(`/api/admin/manuscripts/${id}/convert-to-book`, input));

/* ---------- Book club ---------- */
export const listBookClub = () => call(client.get("/api/admin/book-club"));
export const deleteBookClubMember = (id) =>
  call(client.delete(`/api/admin/book-club/${id}`));

/* ---------- Academy ---------- */
export const listAcademy = () => call(client.get("/api/admin/academy"));
export const updateAcademy = (id, patch) =>
  call(client.patch(`/api/admin/academy/${id}`, patch));
// AJOUTÉ : permet de supprimer une demande dans l'onglet Academy
export const deleteAcademy = (id) =>
  call(client.delete(`/api/admin/academy/${id}`));

/* ---------- Inscriptions aux événements ---------- */
export const listRegistrations = () => call(client.get("/api/admin/registrations"));
export const updateRegistration = (id, patch) =>
  call(client.patch(`/api/admin/registrations/${id}`, patch));

/* ---------- Événements ---------- */
export const listEvents = () => call(client.get("/api/admin/events"));
export const createEvent = (input) => call(client.post("/api/admin/events", input));
export const updateEvent = (id, patch) =>
  call(client.patch(`/api/admin/events/${id}`, patch));
export const deleteEvent = (id) => call(client.delete(`/api/admin/events/${id}`));

/* ---------- Catalogue & Auteurs ---------- */
export const listAuthors = () => call(client.get("/api/admin/authors"));
// PROPREMENT ENGLOBÉ AVEC call(...) POUR CAPTER LES MESSAGES D'ERREUR DU BACKEND :
export const createAuthor = (data) =>
  call(client.post("/api/admin/authors", data));
export const updateAuthor = (slug, data) =>
  call(client.patch(`/api/admin/authors/${slug}`, data));
export const deleteAuthor = (slug) =>
  call(client.delete(`/api/admin/authors/${slug}`));

export const listBooks = () => call(client.get("/api/admin/books"));
export const updateBook = (slug, patch) =>
  call(client.patch(`/api/admin/books/${slug}`, patch));
export const listCollections = () => call(client.get("/api/collections"));

export const deleteBook = async (slug) => {
  const { data } = await client.delete(`/api/admin/books/${slug}`);
  return data;
};

/* ---------- Téléversement (Direct vers Hostinger) ---------- */
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || "https://linen-cassowary-757431.hostingersite.com/upload.php";

export const uploadFile = (file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);

  return call(
    client.post(UPLOAD_URL, fd, {
      onUploadProgress: (e) =>
        onProgress?.(Math.round((e.loaded * 100) / (e.total || file.size))),
    }),
  );
};