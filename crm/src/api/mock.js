/**
 * DONNÉES FICTIVES — à remplacer par les vraies routes /api/admin/*.
 * Tout le faux back-end du CRM est isolé dans ce fichier.
 * Identifiants de démo : admin@hadithi.com / hadithi2026
 */

const DAY = 86400000;
const ago = (days, hours = 10) => new Date(Date.now() - days * DAY + hours * 3600000 - 10 * 3600000).toISOString();
const ahead = (days) => new Date(Date.now() + days * DAY).toISOString();
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));

let password = "hadithi2026";
const admin = { id: 1, email: "admin@hadithi.com", last_login_at: ago(2) };

const collections = [
  { id: "legacy", name: "Legacy" },
  { id: "visions", name: "Visions du Monde" },
  { id: "kids", name: "Kids" },
];

let contacts = [
  ["Aminata Diallo", "aminata.diallo@mail.com", "+221 77 412 33 21", ["auteur"]],
  ["Kwame Mensah", "k.mensah@mail.com", "+233 24 555 1020", ["auteur", "vip"]],
  ["Fatou Ndiaye", "fatou.ndiaye@mail.com", null, ["lectrice"]],
  ["Jean-Baptiste Kouassi", "jb.kouassi@mail.com", "+225 07 08 09 10", ["auteur"]],
  ["Mariam Traoré", "mariam.traore@mail.com", null, []],
  ["Chinedu Okafor", "chinedu.okafor@mail.com", "+234 803 222 1111", ["presse"]],
  ["Awa Sow", "awa.sow@mail.com", null, ["lectrice"]],
  ["Patrice Mbarga", "p.mbarga@mail.com", "+237 6 99 88 77 66", ["auteur"]],
  ["Nadia Benali", "nadia.benali@mail.com", null, []],
  ["Ousmane Bah", "ousmane.bah@mail.com", "+224 622 11 22 33", ["academy"]],
  ["Grace Wanjiru", "grace.wanjiru@mail.com", null, ["lectrice"]],
  ["Hélène Rakoto", "helene.rakoto@mail.com", "+261 34 12 345 67", ["auteur"]],
  ["Samuel Eto'o Ndongo", "s.ndongo@mail.com", null, []],
  ["Aïcha Coulibaly", "aicha.coulibaly@mail.com", null, ["academy"]],
  ["Thomas Lefèvre", "thomas.lefevre@mail.com", "+33 6 12 34 56 78", ["partenaire"]],
  ["Zainab Abubakar", "zainab.a@mail.com", null, ["lectrice"]],
  ["Didier Nkurunziza", "didier.nk@mail.com", "+257 79 000 111", ["auteur"]],
  ["Rokia Keïta", "rokia.keita@mail.com", null, []],
  ["Moussa Camara", "moussa.camara@mail.com", null, ["academy"]],
  ["Esther Mukamana", "esther.muka@mail.com", null, ["lectrice"]],
  ["Ibrahim Touré", "ibrahim.toure@mail.com", "+223 76 54 32 10", ["auteur"]],
  ["Claire Ngono", "claire.ngono@mail.com", null, []],
].map(([name, email, phone, tags], i) => ({
  id: i + 1,
  name,
  email,
  phone,
  tags,
  notes: null,
  consent_at: ago(90 - i * 3),
  unsubscribed: i === 8 ? 1 : 0,
  created_at: ago(90 - i * 3),
}));
contacts[1].notes = `[${new Date(ago(20)).toLocaleDateString("fr-FR")}] Rencontré au salon de Dakar, très motivé.`;

const ms = (id, contact_id, title, genre, status, days) => {
  const history = [{ status: "recu", at: ago(days) }];
  const order = ["recu", "accuse_envoye", "en_lecture", "en_comite"];
  const final = ["accepte", "refuse", "a_retravailler"].includes(status);
  const target = final ? "en_comite" : status;
  for (let i = 1; i <= order.indexOf(target); i++) history.push({ status: order[i], at: ago(days - i * 5) });
  if (final) history.push({ status, at: ago(Math.max(days - 30, 1)) });
  return {
    id,
    contact_id,
    title,
    genre,
    summary:
      "Ce manuscrit retrace un parcours singulier entre engagement public et vie familiale, à travers trois décennies de transformations politiques et sociales. L'auteur y croise souvenirs personnels, archives et analyses pour éclairer les choix d'une génération.",
    author_bio:
      "Ancien haut fonctionnaire et enseignant, l'auteur a consacré sa carrière aux questions de gouvernance et de développement. Il s'agit de son premier ouvrage.",
    file_url: `https://example.com/manuscrits/${id}.pdf`,
    file_name: `${title}.pdf`,
    file_size: 380000 + id * 41000,
    status,
    reading_notes: status === "en_lecture" || status === "en_comite" ? "Écriture solide, structure à resserrer dans la deuxième partie." : null,
    decision_note: final ? "Merci pour votre envoi. Après lecture attentive par notre comité…" : null,
    received_at: ago(days),
    answered_at: final ? ago(Math.max(days - 30, 1)) : null,
    status_history: history,
  };
};

let manuscripts = [
  ms(1, 1, "Les rives du fleuve", "Mémoires", "recu", 1),
  ms(2, 2, "Gouverner sans trahir", "Récit politique", "en_lecture", 60),
  ms(3, 4, "La marche des cacaoyers", "Histoire de vie", "accuse_envoye", 12),
  ms(4, 8, "Douala, carnets d'un maire", "Mémoires", "en_comite", 45),
  ms(5, 12, "L'île aux sept vents", "Histoire de vie", "en_lecture", 75),
  ms(6, 17, "Après la paix", "Essai", "recu", 74),
  ms(7, 21, "Sahel, terres d'avenir", "Essai", "accepte", 80),
  ms(8, 6, "Presse libre, pays libre", "Récit politique", "refuse", 95),
  ms(9, 15, "Le développement autrement", "Essai", "a_retravailler", 70),
  ms(10, 3, "Ma mère, ce pays", "Histoire de vie", "recu", 3),
  ms(11, 13, "Un stade, une nation", "Récit politique", "accuse_envoye", 30),
  ms(12, 9, "Lettres de Tanger", "Mémoires", "en_lecture", 20),
];

let bookClub = [
  [3, "legacy", 2], [5, null, 4], [7, "kids", 6], [11, "visions", 9], [16, "legacy", 15],
  [20, null, 22], [22, "visions", 28], [18, "kids", 40], [1, "legacy", 2], [9, null, 55],
].map(([contact_id, collection_id, d], i) => ({ id: i + 1, contact_id, collection_id, created_at: ago(d) }));

let academy = [
  [10, 0, "Raconter l'exil de mon grand-père, de Conakry à Paris.", "nouvelle", 1],
  [14, 1, "Transformer des heures d'entretiens avec des femmes du marché en livre.", "contactee", 5],
  [19, 2, "Dix ans d'ONG au Mali : en tirer un essai lucide.", "inscrit", 12],
  [5, 0, "Écrire ma vie d'infirmière pour mes enfants.", "nouvelle", 3],
  [18, 1, "Recueillir la mémoire orale de mon village.", "refusee", 33],
  [7, 2, "Mon expérience de microfinance au Sénégal.", "nouvelle", 6],
].map(([contact_id, w, project, status, d], i) => ({
  id: i + 1,
  contact_id,
  workshop: [
    "Structurer un récit de vie",
    "Passer du témoignage oral au manuscrit",
    "Construire un essai à partir d'une expérience de terrain",
  ][w],
  project,
  status,
  created_at: ago(d),
}));

const authors = [
  { id: 1, name: "Aminata Diallo" },
  { id: 2, name: "Kwame Mensah" },
  { id: 3, name: "Ibrahim Touré" },
  { id: 4, name: "Patrice Mbarga" },
];
const books = [
  { id: 1, title: "Sahel, terres d'avenir", author_id: 3 },
  { id: 2, title: "Gouverner sans trahir", author_id: 2 },
  { id: 3, title: "Les rives du fleuve", author_id: 1 },
  { id: 4, title: "Douala, carnets d'un maire", author_id: 4 },
];

const ev = (id, slug, title, date, city, venue, type, capacity, published, author_ids, book_ids) => ({
  id, slug, title, date, city, venue, type, capacity, published, author_ids, book_ids,
  description: `${title}. Une rencontre avec nos auteurs autour de leurs ouvrages, suivie d'un échange avec le public.`,
  practical_info: "Entrée libre sur inscription. Accueil 30 minutes avant le début.",
  img_url: null,
});
let events = [
  ev(1, "lancement-sahel-dakar", "Lancement : Sahel, terres d'avenir", ahead(9), "Dakar", "Institut français", "Lancement", 120, 1, [3], [1]),
  ev(2, "salon-livre-abidjan", "Salon international du livre d'Abidjan", ahead(24), "Abidjan", "Palais de la Culture", "Salon", null, 1, [1, 2], [2, 3]),
  ev(3, "conference-gouvernance-paris", "Conférence : gouverner en Afrique au XXIe siècle", ahead(41), "Paris", "Sciences Po", "Conférence", 80, 0, [2], [2]),
  ev(4, "dedicace-lome", "Dédicace à Lomé", ago(15), "Lomé", "Librairie Bon Pasteur", "Dédicace", 50, 1, [4], [4]),
];

let registrations = [
  ["lancement-sahel-dakar", 1, 2, 3], ["lancement-sahel-dakar", 3, 1, 2], ["lancement-sahel-dakar", 7, 1, 1],
  ["salon-livre-abidjan", 4, 1, 5], ["salon-livre-abidjan", 16, 2, 2],
  ["conference-gouvernance-paris", 15, 1, 1], ["dedicace-lome", 20, 1, 20],
].map(([event_slug, contact_id, seats, d], i) => ({ id: i + 1, event_slug, contact_id, seats, attended: 0, created_at: ago(d) }));

/* ---------- Auth ---------- */
export async function login(email, pwd) {
  await wait(400);
  if (email.trim().toLowerCase() !== admin.email || pwd !== password) {
    const err = new Error("Email ou mot de passe incorrect.");
    err.response = { status: 401 };
    throw err;
  }
  admin.last_login_at = new Date().toISOString();
  return { token: "mock-jwt-token", user: clone(admin) };
}
export async function me() {
  await wait();
  return clone(admin);
}
export async function changePassword(current, next) {
  await wait(400);
  if (current !== password) throw new Error("Le mot de passe actuel est incorrect.");
  password = next;
  return { ok: true };
}

/* ---------- Stats ---------- */
export async function getStats() {
  await wait();
  const now = Date.now();
  const final = ["accepte", "refuse", "a_retravailler"];
  const month = new Date();
  const startMonth = new Date(month.getFullYear(), month.getMonth(), 1).getTime();
  const week = now - 7 * DAY;
  const t = (x) => new Date(x).getTime();
  return {
    manuscripts_todo: manuscripts.filter((m) => ["recu", "accuse_envoye"].includes(m.status)).length,
    manuscripts_reading: manuscripts.filter((m) => ["en_lecture", "en_comite"].includes(m.status)).length,
    manuscripts_late: manuscripts.filter((m) => !final.includes(m.status) && !m.answered_at && now - t(m.received_at) > 70 * DAY).length,
    new_requests_7d: [...manuscripts.map((m) => m.received_at), ...bookClub.map((b) => b.created_at), ...academy.map((a) => a.created_at)].filter((d) => t(d) >= week).length,
    book_club_month: bookClub.filter((b) => t(b.created_at) >= startMonth).length,
    academy_month: academy.filter((a) => t(a.created_at) >= startMonth).length,
  };
}

/* ---------- Contacts ---------- */
export async function listContacts() {
  await wait();
  return clone(contacts);
}
export async function updateContact(id, patch) {
  await wait();
  contacts = contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
  return clone(contacts.find((c) => c.id === id));
}
export async function mergeContacts(keepId, removeId) {
  await wait(400);
  const keep = contacts.find((c) => c.id === keepId);
  const rm = contacts.find((c) => c.id === removeId);
  if (!keep || !rm || keepId === removeId) throw new Error("Contacts invalides.");
  keep.tags = Array.from(new Set([...keep.tags, ...rm.tags]));
  keep.phone = keep.phone || rm.phone;
  keep.notes = [keep.notes, rm.notes].filter(Boolean).join("\n\n") || null;
  const move = (r) => (r.contact_id === removeId ? { ...r, contact_id: keepId } : r);
  manuscripts = manuscripts.map(move);
  bookClub = bookClub.map(move);
  academy = academy.map(move);
  registrations = registrations.map(move);
  contacts = contacts.filter((c) => c.id !== removeId);
  return clone(keep);
}

/* ---------- Manuscrits ---------- */
export async function createManuscript(input) {
  await wait(300);
  let contact_id = input.contact_id;
  if (!contact_id) {
    const email = input.email.trim().toLowerCase();
    const existing = contacts.find((c) => c.email.toLowerCase() === email);
    if (existing) contact_id = existing.id;
    else {
      contact_id = Math.max(0, ...contacts.map((c) => c.id)) + 1;
      contacts = [...contacts, { id: contact_id, name: input.name.trim(), email, phone: null, tags: ["auteur"], notes: null, consent_at: null, unsubscribed: 0, created_at: new Date().toISOString() }];
    }
  }
  const now = new Date().toISOString();
  const m = {
    id: Math.max(0, ...manuscripts.map((x) => x.id)) + 1,
    contact_id,
    title: input.title,
    genre: input.genre,
    summary: input.summary,
    author_bio: input.author_bio,
    file_url: input.file_url ?? null,
    file_name: input.file_name ?? null,
    file_size: input.file_size ?? null,
    status: "recu",
    reading_notes: null,
    decision_note: null,
    received_at: now,
    answered_at: null,
    status_history: [{ status: "recu", at: now }],
  };
  manuscripts = [...manuscripts, m];
  return clone(m);
}
export async function listManuscripts() {
  await wait();
  return clone(manuscripts);
}
export async function updateManuscript(id, patch) {
  await wait();
  manuscripts = manuscripts.map((m) => (m.id === id ? { ...m, ...patch } : m));
  return clone(manuscripts.find((m) => m.id === id));
}
export async function updateManuscriptStatus(id, status) {
  await wait(150);
  const final = ["accepte", "refuse", "a_retravailler"].includes(status);
  manuscripts = manuscripts.map((m) =>
    m.id === id && m.status !== status
      ? {
          ...m,
          status,
          answered_at: final ? m.answered_at || new Date().toISOString() : null,
          status_history: [...m.status_history, { status, at: new Date().toISOString() }],
        }
      : m,
  );
  return clone(manuscripts.find((m) => m.id === id));
}

/* ---------- Book Club / Academy ---------- */
export async function listBookClub() {
  await wait();
  return clone(bookClub);
}
export async function deleteBookClubMember(id) {
  await wait();
  bookClub = bookClub.filter((b) => b.id !== id);
  return { ok: true };
}
export async function listAcademy() {
  await wait();
  return clone(academy);
}
export async function updateAcademy(id, patch) {
  await wait(150);
  academy = academy.map((a) => (a.id === id ? { ...a, ...patch } : a));
  return clone(academy.find((a) => a.id === id));
}

/* ---------- Événements / inscriptions / collections ---------- */
export async function listRegistrations() {
  await wait();
  return clone(registrations);
}
export async function listEvents() {
  await wait();
  return clone(events);
}
export async function listCollections() {
  await wait();
  return clone(collections);
}
export async function listAuthors() {
  await wait();
  return clone(authors);
}
export async function listBooks() {
  await wait();
  return clone(books);
}
export async function createEvent(input) {
  await wait(300);
  if (events.some((e) => e.slug === input.slug)) throw new Error("Ce slug est déjà utilisé.");
  const e = { ...input, id: Math.max(0, ...events.map((x) => x.id)) + 1 };
  events = [...events, e];
  return clone(e);
}
export async function updateEvent(id, patch) {
  await wait(300);
  const old = events.find((e) => e.id === id);
  if (patch.slug && events.some((e) => e.slug === patch.slug && e.id !== id)) throw new Error("Ce slug est déjà utilisé.");
  events = events.map((e) => (e.id === id ? { ...e, ...patch } : e));
  if (old && patch.slug && patch.slug !== old.slug)
    registrations = registrations.map((r) => (r.event_slug === old.slug ? { ...r, event_slug: patch.slug } : r));
  return clone(events.find((e) => e.id === id));
}
export async function deleteEvent(id) {
  await wait(300);
  const old = events.find((e) => e.id === id);
  events = events.filter((e) => e.id !== id);
  if (old) registrations = registrations.filter((r) => r.event_slug !== old.slug);
  return { ok: true };
}
export async function updateRegistration(id, patch) {
  await wait(150);
  registrations = registrations.map((r) => (r.id === id ? { ...r, ...patch } : r));
  return clone(registrations.find((r) => r.id === id));
}

/* ---------- Téléversement ---------- */
/** Simule POST /api/admin/uploads : progression puis URL locale du fichier. */
export async function uploadFile(file, onProgress) {
  for (let p = 10; p <= 100; p += 15) {
    await wait(120);
    onProgress?.(Math.min(p, 100));
  }
  onProgress?.(100);
  return { url: URL.createObjectURL(file), name: file.name, size: file.size };
}
