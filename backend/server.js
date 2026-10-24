const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
/*const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");*/
require("dotenv").config();
const {
  sendManuscriptStatusNotification,
  sendAcademyStatusNotification,
  sendBookClubWelcomeNotification,
  sendNewsletterWelcomeNotification, // <-- Ajouté
  sendNewsletterAdminNotification,   // <-- Ajouté
} = require("./mailer");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET manquant ou trop court (32 caractères minimum).");
}
const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(",") || "*" }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  charset: "utf8mb4",
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

db.pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));

db.getConnection()
  .then((c) => { console.log("Connexion à la base de données réussie !"); c.release(); })
  .catch((err) => console.error("Erreur de connexion :", err.message));

/* =====================================================================
 *  OUTILS & WRAPPERS GLOBAUX (Placés en haut pour être disponibles partout)
 * ===================================================================== */

const route = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: "Erreur serveur" });
  });

const adminRoute = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error("Erreur admin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  });

const httpError = (status, message) => Object.assign(new Error(message), { status });

const adminWrite = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("Erreur admin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  });

const isId = (v) => Number.isInteger(Number(v)) && Number(v) > 0;
const emailOk = (e) => /\S+@\S+\.\S+/.test(e);
const emptyToNull = (v) => (v === "" || v === undefined || v === null ? null : v);

const slugify = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

const toDate = (v) => String(v).slice(0, 10);
const toCapacity = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) throw httpError(400, "La capacité doit être un nombre entier.");
  return n;
};

const MS_STATUS = ["recu", "accuse_envoye", "en_lecture", "en_comite", "accepte", "refuse", "a_retravailler"];
const MS_FINAL = ["accepte", "refuse", "a_retravailler"];
const GENRES = ["Essai", "Mémoires", "Récit politique", "Histoire de vie"];
const ACADEMY_STATUS = ["nouvelle", "contactee", "inscrit", "refusee"];
const EVENT_TYPES = ["Lancement", "Salon", "Conférence", "Dédicace"];

const iso = (v) => (v ? String(v).replace(" ", "T") + "Z" : null);

const parseJson = (v, fallback) => {
  if (v == null) return fallback;
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

const buildSet = (body, map, transforms = {}) => {
  const sets = [];
  const values = [];
  for (const [key, col] of Object.entries(map)) {
    if (body[key] === undefined) continue;
    sets.push(`\`${col}\` = ?`);
    values.push(transforms[key] ? transforms[key](body[key]) : body[key]);
  }
  return { sets, values };
};

const withTransaction = async (fn) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ---------- Formes de réponse ---------- */

const shapeContact = (c) => ({
  ...c,
  tags: parseJson(c.tags, []),
  consent_at: iso(c.consent_at),
  created_at: iso(c.created_at),
});

const getContact = async (conn, id) => {
  const [rows] = await conn.query("SELECT * FROM contacts WHERE id = ?", [id]);
  return rows[0] ? shapeContact(rows[0]) : null;
};

const getManuscript = async (conn, id) => {
  const [rows] = await conn.query("SELECT * FROM manuscripts WHERE id = ?", [id]);
  if (!rows[0]) return null;
  const [hist] = await conn.query(
    "SELECT status, `at` FROM manuscript_status_history WHERE manuscript_id = ? ORDER BY `at`, id",
    [id]
  );
  const m = rows[0];
  return {
    ...m,
    received_at: iso(m.received_at),
    answered_at: iso(m.answered_at),
    status_history: hist.map((h) => ({ status: h.status, at: iso(h.at) })),
  };
};

const getEvent = async (conn, id) => {
  const [rows] = await conn.query("SELECT * FROM events WHERE id = ?", [id]);
  if (!rows[0]) return null;
  const e = rows[0];
  const [ea] = await conn.query("SELECT author_slug FROM event_authors WHERE event_slug = ?", [e.slug]);
  const [eb] = await conn.query("SELECT book_slug FROM event_books WHERE event_slug = ?", [e.slug]);
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    city: e.city,
    venue: e.venue,
    type: e.type,
    description: e.description,
    practical_info: e.practical,
    img_url: e.img_url,
    capacity: e.capacity,
    published: e.is_published,
    author_ids: ea.map((x) => x.author_slug),
    book_ids: eb.map((x) => x.book_slug),
  };
};

// Cache court sur les GET publics
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api/admin")) res.set("Cache-Control", "no-store");
  else res.set("Cache-Control", "public, max-age=60");
  next();
});

// Couvertures et extraits PDF
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =====================================================================
 *  API PUBLIQUE
 * ===================================================================== */

app.get("/api/collections", route(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM collections ORDER BY sort_order");
  res.json(rows);
}));

app.get("/api/books", route(async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM books WHERE is_published = 1 ORDER BY created_at DESC"
  );
  res.json(rows);
}));

app.get("/api/books/:slug", route(async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM books WHERE slug = ? AND is_published = 1",
    [req.params.slug]
  );
  if (!rows.length) return res.status(404).json({ error: "Livre introuvable" });
  res.json(rows[0]);
}));

app.get("/api/authors", route(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM authors WHERE is_published = 1");
  res.json(rows.map((a) => ({ ...a, links: a.links ?? [] })));
}));

app.get("/api/authors/:slug", route(async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM authors WHERE slug = ? AND is_published = 1",
    [req.params.slug]
  );
  if (!rows.length) return res.status(404).json({ error: "Auteur introuvable" });
  res.json({ ...rows[0], links: rows[0].links ?? [] });
}));

app.get("/api/events", route(async (req, res) => {
  const [events] = await db.query(
    "SELECT * FROM events WHERE is_published = 1 ORDER BY date"
  );
  const [ea] = await db.query("SELECT * FROM event_authors");
  const [eb] = await db.query("SELECT * FROM event_books");

  res.json(events.map((e) => ({
    ...e,
    author_slugs: ea.filter((x) => x.event_slug === e.slug).map((x) => x.author_slug),
    book_slugs: eb.filter((x) => x.event_slug === e.slug).map((x) => x.book_slug),
  })));
}));

/* =====================================================================
 *  ADMIN — AUTHENTIFICATION
 * ===================================================================== */

const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);
const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  last_login_at: iso(u.last_login_at) || u.last_login_at || new Date().toISOString(),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ message: "Trop de tentatives. Réessayez dans quelques minutes." }),
});

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentification requise." });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Session expirée. Reconnectez-vous." });
    }

    const [rows] = await db.query(
      "SELECT id, email, name, role, is_active, token_version, last_login_at FROM admin_users WHERE id = ?",
      [payload.sub]
    );
    const user = rows[0];
    if (!user || !user.is_active || user.token_version !== payload.tv) {
      return res.status(401).json({ message: "Session invalide. Reconnectez-vous." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Erreur auth :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

app.post("/api/admin/login", loginLimiter, adminRoute(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const [rows] = await db.query("SELECT * FROM admin_users WHERE email = ?", [email]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

  if (!user || !ok || !user.is_active) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect." });
  }

  await db.query("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?", [user.id]);
  const [freshRows] = await db.query("SELECT * FROM admin_users WHERE id = ?", [user.id]);
  const loggedUser = freshRows[0] || user;

  const token = jwt.sign({ sub: loggedUser.id, tv: loggedUser.token_version }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
  res.json({ token, user: publicUser(loggedUser) });
}));

app.get("/api/admin/me", requireAuth, (req, res) => res.json(publicUser(req.user)));

app.patch("/api/admin/me/password", requireAuth, adminRoute(async (req, res) => {
  const current = String(req.body?.current || "");
  const next = String(req.body?.next || "");

  if (next.length < 10) {
    return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 10 caractères." });
  }
  if (next === current) {
    return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'actuel." });
  }

  const [rows] = await db.query("SELECT password_hash FROM admin_users WHERE id = ?", [req.user.id]);
  if (!(await bcrypt.compare(current, rows[0].password_hash))) {
    return res.status(400).json({ message: "Mot de passe actuel incorrect." });
  }

  const hash = await bcrypt.hash(next, 12);
  await db.query(
    "UPDATE admin_users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?",
    [hash, req.user.id]
  );
  res.json({ ok: true });
}));

/* =====================================================================
 *  ADMIN — ROUTES EN LECTURE
 * ===================================================================== */

app.get("/api/admin/stats", requireAuth, adminRoute(async (req, res) => {
  const [[m]] = await db.query(`
    SELECT
      COALESCE(SUM(status IN ('recu','accuse_envoye')), 0)   AS todo,
      COALESCE(SUM(status IN ('en_lecture','en_comite')), 0) AS reading,
      COALESCE(SUM(
        status NOT IN ('accepte','refuse','a_retravailler')
        AND answered_at IS NULL
        AND received_at < NOW() - INTERVAL 70 DAY
      ), 0) AS late,
      COALESCE(SUM(received_at >= NOW() - INTERVAL 7 DAY), 0) AS d7
    FROM manuscripts
  `);
  const [[b]] = await db.query(`
    SELECT
      COALESCE(SUM(created_at >= NOW() - INTERVAL 7 DAY), 0)            AS d7,
      COALESCE(SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')), 0)    AS mo
    FROM book_club_members
  `);
  const [[a]] = await db.query(`
    SELECT
      COALESCE(SUM(created_at >= NOW() - INTERVAL 7 DAY), 0)            AS d7,
      COALESCE(SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')), 0)    AS mo
    FROM academy_requests
  `);

  res.json({
    manuscripts_todo: Number(m.todo),
    manuscripts_reading: Number(m.reading),
    manuscripts_late: Number(m.late),
    new_requests_7d: Number(m.d7) + Number(b.d7) + Number(a.d7),
    book_club_month: Number(b.mo),
    academy_month: Number(a.mo),
  });
}));

app.get("/api/admin/contacts", requireAuth, adminRoute(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM contacts ORDER BY created_at DESC, id DESC");
  res.json(rows.map((c) => ({
    ...c,
    tags: parseJson(c.tags, []),
    consent_at: iso(c.consent_at),
    created_at: iso(c.created_at),
  })));
}));

app.get("/api/admin/manuscripts", requireAuth, adminRoute(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM manuscripts ORDER BY received_at DESC, id DESC");
  const [hist] = await db.query(
    "SELECT manuscript_id, status, `at` FROM manuscript_status_history ORDER BY `at`, id"
  );

  const byManuscript = new Map();
  for (const h of hist) {
    if (!byManuscript.has(h.manuscript_id)) byManuscript.set(h.manuscript_id, []);
    byManuscript.get(h.manuscript_id).push({ status: h.status, at: iso(h.at) });
  }

  res.json(rows.map((m) => ({
    ...m,
    received_at: iso(m.received_at),
    answered_at: iso(m.answered_at),
    status_history: byManuscript.get(m.id) ?? [],
  })));
}));

app.get("/api/admin/book-club", requireAuth, adminRoute(async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, contact_id, collection_id, created_at FROM book_club_members ORDER BY created_at DESC, id DESC"
  );
  res.json(rows.map((r) => ({ ...r, created_at: iso(r.created_at) })));
}));

app.get("/api/admin/academy", requireAuth, adminRoute(async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, contact_id, workshop, project, status, created_at FROM academy_requests ORDER BY created_at DESC, id DESC"
  );
  res.json(rows.map((r) => ({ ...r, created_at: iso(r.created_at) })));
}));

app.get("/api/admin/registrations", requireAuth, adminRoute(async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, event_slug, contact_id, seats, attended, created_at FROM event_registrations ORDER BY created_at DESC, id DESC"
  );
  res.json(rows.map((r) => ({ ...r, created_at: iso(r.created_at) })));
}));

app.get("/api/admin/events", requireAuth, adminRoute(async (req, res) => {
  const [events] = await db.query("SELECT * FROM events ORDER BY date DESC");
  const [ea] = await db.query("SELECT * FROM event_authors");
  const [eb] = await db.query("SELECT * FROM event_books");

  res.json(events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    city: e.city,
    venue: e.venue,
    type: e.type,
    description: e.description,
    practical_info: e.practical,
    img_url: e.img_url,
    capacity: e.capacity,
    published: e.is_published,
    author_ids: ea.filter((x) => x.event_slug === e.slug).map((x) => x.author_slug),
    book_ids: eb.filter((x) => x.event_slug === e.slug).map((x) => x.book_slug),
  })));
}));

app.get("/api/admin/authors", requireAuth, adminRoute(async (req, res) => {
  const [rows] = await db.query(`
    SELECT a.*, COUNT(b.slug) AS books_count 
    FROM authors a 
    LEFT JOIN books b ON b.author_slug = a.slug 
    GROUP BY a.slug 
    ORDER BY a.name ASC
  `);
  res.json(rows.map((a) => ({
    ...a,
    id: a.slug,
    links: parseJson(a.links, []),
    books_count: Number(a.books_count || 0),
  })));
}));


app.post("/api/admin/authors", requireAuth, adminWrite(async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  if (!name) throw httpError(400, "Le nom de l'auteur est obligatoire.");

  let slug = slugify(b.slug || name);
  if (!slug) throw httpError(400, "Le slug de l'auteur est invalide.");

  const [existing] = await db.query("SELECT slug FROM authors WHERE slug = ?", [slug]);
  if (existing[0]) throw httpError(409, "Un auteur avec ce slug/nom existe déjà.");

  const links = Array.isArray(b.links) ? JSON.stringify(b.links) : null;

  await db.query(
    `INSERT INTO authors (slug, name, role, bio, img_url, links, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      name,
      emptyToNull(b.role ? String(b.role).trim() : null),
      emptyToNull(b.bio ? String(b.bio).trim() : null),
      emptyToNull(b.img_url ? String(b.img_url).trim() : null),
      links,
      b.is_published ? 1 : 0,
    ]
  );

  const [created] = await db.query("SELECT * FROM authors WHERE slug = ?", [slug]);
  res.status(201).json({ ...created[0], id: created[0].slug, links: parseJson(created[0].links, []), books_count: 0 });
}));

app.patch("/api/admin/authors/:slug", requireAuth, adminWrite(async (req, res) => {
  const slug = req.params.slug;
  const b = req.body || {};

  const [existing] = await db.query("SELECT * FROM authors WHERE slug = ?", [slug]);
  if (!existing[0]) throw httpError(404, "Auteur introuvable.");

  const { sets, values } = buildSet(
    b,
    { name: "name", role: "role", bio: "bio", img_url: "img_url", is_published: "is_published", links: "links" },
    {
      name: (v) => String(v).trim(),
      role: emptyToNull,
      bio: emptyToNull,
      img_url: emptyToNull,
      is_published: (v) => (v ? 1 : 0),
      links: (v) => (Array.isArray(v) ? JSON.stringify(v) : null),
    }
  );

  if (sets.length > 0) {
    await db.query(`UPDATE authors SET ${sets.join(", ")} WHERE slug = ?`, [...values, slug]);
  }

  const [updated] = await db.query(`
    SELECT a.*, COUNT(b.slug) AS books_count 
    FROM authors a 
    LEFT JOIN books b ON b.author_slug = a.slug 
    WHERE a.slug = ?
    GROUP BY a.slug
  `, [slug]);

  res.json({ ...updated[0], id: updated[0].slug, links: parseJson(updated[0].links, []), books_count: Number(updated[0].books_count || 0) });
}));

app.delete("/api/admin/authors/:slug", requireAuth, adminWrite(async (req, res) => {
  const slug = req.params.slug;
  const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM books WHERE author_slug = ?", [slug]);
  if (count > 0) {
    throw httpError(400, `Impossible de supprimer cet auteur : il a ${count} livre(s) rattaché(s) au catalogue.`);
  }

  const [r] = await db.query("DELETE FROM authors WHERE slug = ?", [slug]);
  if (!r.affectedRows) throw httpError(404, "Auteur introuvable.");
  res.json({ ok: true });
}));

// GET /api/admin/books → renvoie tous les livres complets (couvertures, prix, etc.)
app.get("/api/admin/books", requireAuth, adminRoute(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM books ORDER BY created_at DESC");
  res.json(rows.map((b) => ({
    ...b,
    id: b.slug,
    author_id: b.author_slug,
    published: b.is_published,
  })));
}));

/* =====================================================================
 *  ADMIN — ROUTES EN ÉCRITURE
 * ===================================================================== */

// PATCH /api/admin/books/:slug → Modifier toutes les informations d'un livre
app.patch("/api/admin/books/:slug", requireAuth, adminWrite(async (req, res) => {
  const slug = req.params.slug;
  const b = req.body || {};

  const [existing] = await db.query("SELECT * FROM books WHERE slug = ?", [slug]);
  if (!existing[0]) throw httpError(404, "Livre introuvable.");

  const { sets, values } = buildSet(
    b,
    {
      title: "title",
      author_slug: "author_slug",
      collection_id: "collection_id",
      format: "format",
      theme: "theme",
      availability: "availability",
      price_cents: "price_cents",
      pages: "pages",
      isbn: "isbn",
      cover_tone: "cover_tone",
      cover_url: "cover_url",
      history: "history",
      why: "why",
      published: "is_published",
      is_published: "is_published",
    },
    {
      title: (v) => String(v).trim(),
      author_slug: emptyToNull,
      collection_id: (v) => String(v).trim(),
      format: (v) => String(v).trim(),
      theme: (v) => String(v).trim(),
      availability: (v) => String(v).trim(),
      price_cents: (v) => (v === "" || v === null || v === undefined ? null : Math.round(Number(v))),
      pages: emptyToNull,
      isbn: emptyToNull,
      cover_tone: (v) => (["navy", "warm", "blue", "cream"].includes(v) ? v : "navy"),
      cover_url: emptyToNull,
      history: emptyToNull,
      why: emptyToNull,
      published: (v) => (v ? 1 : 0),
      is_published: (v) => (v ? 1 : 0),
    }
  );

  if (sets.length > 0) {
    await db.query(`UPDATE books SET ${sets.join(", ")} WHERE slug = ?`, [...values, slug]);
  }

  const [rows] = await db.query("SELECT * FROM books WHERE slug = ?", [slug]);
  res.json({ ...rows[0], id: rows[0].slug, author_id: rows[0].author_slug, published: rows[0].is_published });
}));

// DELETE /api/admin/books/:slug → Supprimer un livre du catalogue
app.delete("/api/admin/books/:slug", requireAuth, adminWrite(async (req, res) => {
  const slug = req.params.slug;
  const [r] = await db.query("DELETE FROM books WHERE slug = ?", [slug]);
  if (!r.affectedRows) throw httpError(404, "Livre introuvable.");
  res.json({ ok: true });
}));

// PATCH /api/admin/contacts/:id
app.patch("/api/admin/contacts/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  const b = { ...(req.body || {}) };

  if (b.email !== undefined) {
    b.email = String(b.email).trim().toLowerCase();
    if (!emailOk(b.email)) throw httpError(400, "Email invalide.");
  }
  if (b.name !== undefined && !String(b.name).trim()) throw httpError(400, "Le nom est obligatoire.");

  const { sets, values } = buildSet(
    b,
    { name: "name", email: "email", phone: "phone", tags: "tags", notes: "notes", unsubscribed: "unsubscribed" },
    {
      name: (v) => String(v).trim(),
      phone: (v) => emptyToNull(v ? String(v).trim() : null),
      tags: (v) =>
        JSON.stringify(
          Array.isArray(v) ? [...new Set(v.map((t) => String(t).trim().toLowerCase()).filter(Boolean))] : []
        ),
      notes: emptyToNull,
      unsubscribed: (v) => (v ? 1 : 0),
    }
  );
  if (!sets.length) throw httpError(400, "Aucune modification.");

  try {
    await db.query(`UPDATE contacts SET ${sets.join(", ")} WHERE id = ?`, [...values, id]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") throw httpError(409, "Cet email est déjà utilisé par un autre contact.");
    throw err;
  }

  const contact = await getContact(db, id);
  if (!contact) throw httpError(404, "Contact introuvable.");
  res.json(contact);
}));

// POST /api/admin/contacts/merge
app.post("/api/admin/contacts/merge", requireAuth, adminWrite(async (req, res) => {
  const keepId = Number(req.body?.keepId);
  const removeId = Number(req.body?.removeId);
  if (!isId(keepId) || !isId(removeId) || keepId === removeId) throw httpError(400, "Contacts invalides.");

  const merged = await withTransaction(async (conn) => {
    const [rows] = await conn.query("SELECT * FROM contacts WHERE id IN (?, ?) FOR UPDATE", [keepId, removeId]);
    const keep = rows.find((c) => c.id === keepId);
    const rm = rows.find((c) => c.id === removeId);
    if (!keep || !rm) throw httpError(404, "Contact introuvable.");

    const tags = [...new Set([...parseJson(keep.tags, []), ...parseJson(rm.tags, [])])];
    const notes = [keep.notes, rm.notes].filter(Boolean).join("\n\n") || null;
    await conn.query(
      "UPDATE contacts SET tags = ?, phone = ?, notes = ?, consent_at = ?, unsubscribed = ? WHERE id = ?",
      [
        JSON.stringify(tags),
        keep.phone || rm.phone || null,
        notes,
        keep.consent_at || rm.consent_at || null,
        keep.unsubscribed || rm.unsubscribed ? 1 : 0,
        keepId,
      ]
    );

    await conn.query("UPDATE manuscripts SET contact_id = ? WHERE contact_id = ?", [keepId, removeId]);
    await conn.query("UPDATE book_club_members SET contact_id = ? WHERE contact_id = ?", [keepId, removeId]);
    await conn.query("UPDATE academy_requests SET contact_id = ? WHERE contact_id = ?", [keepId, removeId]);

    await conn.query(
      `UPDATE event_registrations k
         JOIN event_registrations r ON r.event_slug = k.event_slug
          AND k.contact_id = ? AND r.contact_id = ?
          SET k.seats = k.seats + r.seats, k.attended = GREATEST(k.attended, r.attended)`,
      [keepId, removeId]
    );
    await conn.query(
      `DELETE r FROM event_registrations r
         JOIN event_registrations k ON k.event_slug = r.event_slug AND k.contact_id = ?
        WHERE r.contact_id = ?`,
      [keepId, removeId]
    );
    await conn.query("UPDATE event_registrations SET contact_id = ? WHERE contact_id = ?", [keepId, removeId]);

    await conn.query("DELETE FROM contacts WHERE id = ?", [removeId]);
    return getContact(conn, keepId);
  });

  res.json(merged);
}));

// POST /api/admin/manuscripts
app.post("/api/admin/manuscripts", requireAuth, adminWrite(async (req, res) => {
  const b = req.body || {};
  const title = String(b.title || "").trim();
  const summary = String(b.summary || "").trim();
  if (!title) throw httpError(400, "Le titre est obligatoire.");
  if (!summary) throw httpError(400, "Le résumé est obligatoire.");
  if (!GENRES.includes(b.genre)) throw httpError(400, "Genre invalide.");

  if (b.consent !== true && b.consent !== undefined) {
    throw httpError(400, "Le consentement de l'auteur est requis.");
  }
  const phone = emptyToNull(String(b.phone || "").trim().slice(0, 50));

  const created = await withTransaction(async (conn) => {
    let contactId = b.contact_id ? Number(b.contact_id) : null;

    if (contactId) {
      if (!(await getContact(conn, contactId))) throw httpError(400, "Auteur introuvable.");
    } else {
      const email = String(b.email || "").trim().toLowerCase();
      const name = String(b.name || "").trim();
      if (!name || !emailOk(email)) throw httpError(400, "Nom et email de l'auteur requis.");
      const [ex] = await conn.query("SELECT id FROM contacts WHERE email = ?", [email]);
      if (ex[0]) {
        contactId = ex[0].id;
        await conn.query(
          "UPDATE contacts SET phone = COALESCE(NULLIF(phone, ''), ?), consent_at = COALESCE(consent_at, NOW()) WHERE id = ?",
          [phone, contactId]
        );
      } else {
        const [ins] = await conn.query(
          "INSERT INTO contacts (name, email, phone, tags, consent_at) VALUES (?, ?, ?, ?, NOW())",
          [name, email, phone, JSON.stringify(["auteur"])]
        );
        contactId = ins.insertId;
      }
    }

    // Vérification des doublons
    const [existing] = await conn.query(
      `SELECT id, title, status, received_at 
       FROM manuscripts 
       WHERE contact_id = ? 
         AND LOWER(TRIM(title)) = LOWER(TRIM(?))
         AND status NOT IN ('refuse', 'a_retravailler')
       LIMIT 1`,
      [contactId, title]
    );

    if (existing[0]) {
      throw httpError(
        409,
        `Un manuscrit avec ce titre (« ${existing[0].title} ») est déjà enregistré pour cet auteur et est actuellement en statut « ${existing[0].status} ».`
      );
    }

    const [ins] = await conn.query(
      `INSERT INTO manuscripts (contact_id, title, genre, summary, author_bio, file_url, file_name, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contactId,
        title,
        b.genre,
        summary,
        String(b.author_bio || "").trim(),
        emptyToNull(b.file_url),
        emptyToNull(b.file_name),
        emptyToNull(b.file_size),
      ]
    );
    await conn.query("INSERT INTO manuscript_status_history (manuscript_id, status) VALUES (?, 'recu')", [ins.insertId]);
    return getManuscript(conn, ins.insertId);
  });

  res.status(201).json(created);
}));

// PATCH /api/admin/manuscripts/:id/status
app.patch("/api/admin/manuscripts/:id/status", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body?.status || "");
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  if (!MS_STATUS.includes(status)) throw httpError(400, "Statut invalide.");

  const { updated, contact } = await withTransaction(async (conn) => {
    const [rows] = await conn.query("SELECT * FROM manuscripts WHERE id = ? FOR UPDATE", [id]);
    if (!rows[0]) throw httpError(404, "Manuscrit introuvable.");

    if (rows[0].status !== status) {
      const answered = MS_FINAL.includes(status) ? "COALESCE(answered_at, NOW())" : "NULL";
      await conn.query(`UPDATE manuscripts SET status = ?, answered_at = ${answered} WHERE id = ?`, [status, id]);
      await conn.query("INSERT INTO manuscript_status_history (manuscript_id, status) VALUES (?, ?)", [id, status]);
    }

    const manuscript = await getManuscript(conn, id);
    const [contactRows] = await conn.query("SELECT * FROM contacts WHERE id = ?", [manuscript.contact_id]);

    return { updated: manuscript, contact: contactRows[0] };
  });

  if (contact && contact.email) {
    sendManuscriptStatusNotification(updated, contact).catch((err) =>
      console.error("Erreur notification email :", err)
    );
  }

  res.json(updated);
}));

// PATCH /api/admin/manuscripts/:id
app.patch("/api/admin/manuscripts/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  const b = req.body || {};

  if (b.title !== undefined && !String(b.title).trim()) throw httpError(400, "Le titre est obligatoire.");
  if (b.summary !== undefined && !String(b.summary).trim()) throw httpError(400, "Le résumé est obligatoire.");
  if (b.genre !== undefined && !GENRES.includes(b.genre)) throw httpError(400, "Genre invalide.");

  const { sets, values } = buildSet(
    b,
    {
      title: "title", genre: "genre", summary: "summary", author_bio: "author_bio",
      reading_notes: "reading_notes", decision_note: "decision_note",
      file_url: "file_url", file_name: "file_name", file_size: "file_size",
    },
    {
      title: (v) => String(v).trim(),
      summary: (v) => String(v).trim(),
      author_bio: (v) => String(v ?? "").trim(),
      reading_notes: emptyToNull,
      decision_note: emptyToNull,
      file_url: emptyToNull,
      file_name: emptyToNull,
      file_size: emptyToNull,
    }
  );
  if (!sets.length) throw httpError(400, "Aucune modification.");

  await db.query(`UPDATE manuscripts SET ${sets.join(", ")} WHERE id = ?`, [...values, id]);
  const m = await getManuscript(db, id);
  if (!m) throw httpError(404, "Manuscrit introuvable.");
  res.json(m);
}));

// POST /api/admin/manuscripts/:id/convert-to-book
app.post("/api/admin/manuscripts/:id/convert-to-book", requireAuth, adminWrite(async (req, res) => {
  const manuscriptId = Number(req.params.id);
  if (!isId(manuscriptId)) throw httpError(400, "Identifiant de manuscrit invalide.");

  const b = req.body || {};
  if (!b.collection_id) throw httpError(400, "La collection est obligatoire.");
  if (!b.format) throw httpError(400, "Le format est obligatoire.");
  if (!b.theme) throw httpError(400, "Le thème est obligatoire.");

  const createdBook = await withTransaction(async (conn) => {
    const [msRows] = await conn.query("SELECT * FROM manuscripts WHERE id = ? FOR UPDATE", [manuscriptId]);
    const manuscript = msRows[0];
    if (!manuscript) throw httpError(404, "Manuscrit introuvable.");

    if (manuscript.status !== "accepte") {
      throw httpError(400, "Seul un manuscrit ayant le statut « Accepté » peut être converti en livre.");
    }

    const [contactRows] = await conn.query("SELECT * FROM contacts WHERE id = ?", [manuscript.contact_id]);
    const contact = contactRows[0];
    if (!contact) throw httpError(404, "Auteur (contact) introuvable.");

    let authorSlug = slugify(contact.name);
    const [existingAuthor] = await conn.query("SELECT slug FROM authors WHERE slug = ?", [authorSlug]);

    if (!existingAuthor[0]) {
      await conn.query(
        `INSERT INTO authors (slug, name, role, bio, is_published)
         VALUES (?, ?, ?, ?, 1)`,
        [authorSlug, contact.name, "Auteur", manuscript.author_bio || null]
      );
    }


    let bookSlug = slugify(manuscript.title);
    const [existingBook] = await conn.query(
      "SELECT slug, title FROM books WHERE slug = ? OR (LOWER(title) = LOWER(?) AND author_slug = ?) LIMIT 1",
      [bookSlug, manuscript.title, authorSlug]
    );

    if (existingBook[0]) {
      throw httpError(409, `Ce manuscrit a déjà été converti en livre au catalogue (« ${existingBook[0].title} »).`);
    }

    const coverUrl = emptyToNull(b.cover_url) || "/covers/cover-01.webp";
    const coverTone = ["navy", "warm", "blue", "cream"].includes(b.cover_tone) ? b.cover_tone : "navy";

    await conn.query(
      `INSERT INTO books 
        (slug, title, author_slug, collection_id, format, theme, availability, price_cents, isbn, cover_tone, cover_url, history, is_published)
       VALUES (?, ?, ?, ?, ?, ?, 'À paraître', ?, ?, ?, ?, ?, 0)`,
      [
        bookSlug,
        manuscript.title,
        authorSlug,
        b.collection_id,
        b.format,
        b.theme,
        b.price_cents ? Number(b.price_cents) : 1990,
        emptyToNull(b.isbn),
        coverTone,
        coverUrl,
        manuscript.summary,
      ]
    );

    const [newBookRows] = await conn.query("SELECT * FROM books WHERE slug = ?", [bookSlug]);
    return newBookRows[0];
  });

  res.status(201).json(createdBook);
}));

/* =====================================================================
 *  TÉLÉVERSEMENT
 * ===================================================================== */

/*const DOC_EXT = [".pdf", ".doc", ".docx"];
const IMG_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_DOC = 10 * 1024 * 1024;
const MAX_IMG = 5 * 1024 * 1024;

const uploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const dir = path.join(__dirname, "uploads", IMG_EXT.includes(ext) ? "images" : "manuscripts");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString("hex") + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: MAX_DOC, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(DOC_EXT.includes(ext) || IMG_EXT.includes(ext) ? null : new Error("BAD_TYPE"), true);
  },
});

app.post("/api/admin/uploads", requireAuth, (req, res) => {
  uploader.single("file")(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Fichier trop volumineux (10 Mo maximum)."
          : err.message === "BAD_TYPE"
            ? "Format non accepté (PDF, DOC, DOCX, JPG, PNG ou WEBP)."
            : "Téléversement impossible.";
      return res.status(400).json({ message });
    }
    if (!req.file) return res.status(400).json({ message: "Aucun fichier reçu." });

    const ext = path.extname(req.file.filename).toLowerCase();
    const isImage = IMG_EXT.includes(ext);
    if (isImage && req.file.size > MAX_IMG) {
      fs.unlink(req.file.path, () => { });
      return res.status(400).json({ message: "Image trop volumineuse (5 Mo maximum)." });
    }

    const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const folder = isImage ? "images" : "manuscripts";
    res.status(201).json({
      url: `${base}/uploads/${folder}/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size,
    });
  });
});*/

/* =====================================================================
 *  BOOK CLUB / ACADEMY / INSCRIPTIONS
 * ===================================================================== */

app.delete("/api/admin/book-club/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  const [r] = await db.query("DELETE FROM book_club_members WHERE id = ?", [id]);
  if (!r.affectedRows) throw httpError(404, "Inscrit introuvable.");
  res.json({ ok: true });
}));

app.patch("/api/admin/academy/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body?.status || "");
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  if (!ACADEMY_STATUS.includes(status)) throw httpError(400, "Statut invalide.");

  await db.query("UPDATE academy_requests SET status = ? WHERE id = ?", [status, id]);
  const [rows] = await db.query(
    "SELECT id, contact_id, workshop, project, status, created_at FROM academy_requests WHERE id = ?",
    [id]
  );
  if (!rows[0]) throw httpError(404, "Demande introuvable.");

  const updatedRequest = rows[0];

  // RÉCUPÉRATION DU CONTACT ET ENVOI DE L'EMAIL AUTOMATIQUE
  const [contactRows] = await db.query("SELECT * FROM contacts WHERE id = ?", [updatedRequest.contact_id]);
  const contact = contactRows[0];

  if (contact && contact.email && ["contactee", "inscrit", "refusee"].includes(status)) {
    sendAcademyStatusNotification(updatedRequest, contact).catch((err) =>
      console.error("Erreur envoi notification Academy :", err)
    );
  }

  res.json({ ...updatedRequest, created_at: iso(updatedRequest.created_at) });
}));

// DELETE /api/admin/academy/:id → Supprimer une candidature Academy
app.delete("/api/admin/academy/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  const [r] = await db.query("DELETE FROM academy_requests WHERE id = ?", [id]);
  if (!r.affectedRows) throw httpError(404, "Demande introuvable.");
  res.json({ ok: true });
}));

app.patch("/api/admin/registrations/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  if (req.body?.attended === undefined) throw httpError(400, "Aucune modification.");

  await db.query("UPDATE event_registrations SET attended = ? WHERE id = ?", [req.body.attended ? 1 : 0, id]);
  const [rows] = await db.query(
    "SELECT id, event_slug, contact_id, seats, attended, created_at FROM event_registrations WHERE id = ?",
    [id]
  );
  if (!rows[0]) throw httpError(404, "Inscription introuvable.");
  res.json({ ...rows[0], created_at: iso(rows[0].created_at) });
}));


// POST /api/book-club → Inscription au Book Club depuis le site public
app.post("/api/book-club", route(async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim().toLowerCase();
  const collection_id = emptyToNull(b.collection_id);

  if (!name) return res.status(400).json({ error: "Le nom est obligatoire." });
  if (!email || !emailOk(email)) return res.status(400).json({ error: "Une adresse email valide est obligatoire." });

  // 1. Transaction SQL : créer/récupérer le contact puis inscrire au Book Club
  const { member, contact, collectionName } = await withTransaction(async (conn) => {
    // A. Vérifier ou insérer dans la table `contacts`
    const [ex] = await conn.query("SELECT * FROM contacts WHERE email = ?", [email]);
    let contactId;
    let contactData;

    if (ex[0]) {
      contactId = ex[0].id;
      contactData = ex[0];
      // Si désinscrit, on le réinscrit
      await conn.query("UPDATE contacts SET name = ?, consent_at = COALESCE(consent_at, NOW()), unsubscribed = 0 WHERE id = ?", [name, contactId]);
    } else {
      const [ins] = await conn.query(
        "INSERT INTO contacts (name, email, tags, consent_at, unsubscribed) VALUES (?, ?, ?, NOW(), 0)",
        [name, email, JSON.stringify(["lecteur"])]
      );
      contactId = ins.insertId;
      const [c] = await conn.query("SELECT * FROM contacts WHERE id = ?", [contactId]);
      contactData = c[0];
    }

    // B. Vérifier si déjà inscrit au Book Club
    const [existingMember] = await conn.query("SELECT id FROM book_club_members WHERE contact_id = ?", [contactId]);
    if (existingMember[0]) {
      // Met à jour sa collection préférée s'il l'a changée
      await conn.query("UPDATE book_club_members SET collection_id = ? WHERE id = ?", [collection_id, existingMember[0].id]);
    } else {
      await conn.query("INSERT INTO book_club_members (contact_id, collection_id) VALUES (?, ?)", [contactId, collection_id]);
    }

    // C. Récupérer le nom de la collection
    let colName = "Toutes collections";
    if (collection_id) {
      const [cols] = await conn.query("SELECT name FROM collections WHERE id = ?", [collection_id]);
      if (cols[0]) colName = cols[0].name;
    }

    return { contact: contactData, collectionName: colName };
  });

  // 2. ENVOI AUTOMATIQUE DE L'EMAIL DE BIENVENUE
  if (contact && contact.email) {
    sendBookClubWelcomeNotification(contact, collectionName).catch((err) =>
      console.error("Erreur lors de l'envoi de l'email Book Club :", err)
    );
  }

  res.status(201).json({ ok: true, message: "Bienvenue au Book Club !" });
}));

/* =====================================================================
 *  ÉVÉNEMENTS
 * ===================================================================== */

const setEventLinks = async (conn, slug, authorIds, bookIds) => {
  if (Array.isArray(authorIds)) {
    await conn.query("DELETE FROM event_authors WHERE event_slug = ?", [slug]);
    const rows = [...new Set(authorIds.map(String).filter(Boolean))].map((a) => [slug, a]);
    if (rows.length) await conn.query("INSERT INTO event_authors (event_slug, author_slug) VALUES ?", [rows]);
  }
  if (Array.isArray(bookIds)) {
    await conn.query("DELETE FROM event_books WHERE event_slug = ?", [slug]);
    const rows = [...new Set(bookIds.map(String).filter(Boolean))].map((b) => [slug, b]);
    if (rows.length) await conn.query("INSERT INTO event_books (event_slug, book_slug) VALUES ?", [rows]);
  }
};

const eventDbError = (err) => {
  if (err.code === "ER_DUP_ENTRY") return httpError(409, "Ce slug est déjà utilisé.");
  if (err.code === "ER_NO_REFERENCED_ROW_2") return httpError(400, "Auteur ou livre introuvable.");
  return err;
};

app.post("/api/admin/events", requireAuth, adminWrite(async (req, res) => {
  const b = req.body || {};
  const title = String(b.title || "").trim();
  const slug = slugify(b.slug || title);
  if (!title) throw httpError(400, "Le titre est obligatoire.");
  if (!slug) throw httpError(400, "Le slug est invalide.");
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(b.date || ""))) throw httpError(400, "Date invalide.");
  if (!String(b.city || "").trim()) throw httpError(400, "La ville est obligatoire.");
  if (!EVENT_TYPES.includes(b.type)) throw httpError(400, "Type d'événement invalide.");
  const capacity = toCapacity(b.capacity);

  let created;
  try {
    created = await withTransaction(async (conn) => {
      await conn.query(
        `INSERT INTO events (slug, title, date, city, venue, type, description, practical, img_url, is_published, capacity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slug, title, toDate(b.date), String(b.city).trim(), emptyToNull(b.venue), b.type,
          emptyToNull(b.description), emptyToNull(b.practical_info), emptyToNull(b.img_url),
          b.published ? 1 : 0, capacity,
        ]
      );
      await setEventLinks(conn, slug, b.author_ids, b.book_ids);
      const [row] = await conn.query("SELECT id FROM events WHERE slug = ?", [slug]);
      return getEvent(conn, row[0].id);
    });
  } catch (err) {
    throw eventDbError(err);
  }

  res.status(201).json(created);
}));

app.patch("/api/admin/events/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  const b = { ...(req.body || {}) };

  if (b.title !== undefined && !String(b.title).trim()) throw httpError(400, "Le titre est obligatoire.");
  if (b.slug !== undefined) {
    b.slug = slugify(b.slug);
    if (!b.slug) throw httpError(400, "Le slug est invalide.");
  }
  if (b.date !== undefined && !/^\d{4}-\d{2}-\d{2}/.test(String(b.date))) throw httpError(400, "Date invalide.");
  if (b.city !== undefined && !String(b.city).trim()) throw httpError(400, "La ville est obligatoire.");
  if (b.type !== undefined && !EVENT_TYPES.includes(b.type)) throw httpError(400, "Type d'événement invalide.");

  const { sets, values } = buildSet(
    b,
    {
      slug: "slug", title: "title", date: "date", city: "city", venue: "venue", type: "type",
      description: "description", practical_info: "practical", img_url: "img_url",
      capacity: "capacity", published: "is_published",
    },
    {
      title: (v) => String(v).trim(),
      date: toDate,
      city: (v) => String(v).trim(),
      venue: emptyToNull,
      description: emptyToNull,
      practical_info: emptyToNull,
      img_url: emptyToNull,
      capacity: toCapacity,
      published: (v) => (v ? 1 : 0),
    }
  );
  const hasLinks = Array.isArray(b.author_ids) || Array.isArray(b.book_ids);
  if (!sets.length && !hasLinks) throw httpError(400, "Aucune modification.");

  let updated;
  try {
    updated = await withTransaction(async (conn) => {
      const [cur] = await conn.query("SELECT slug FROM events WHERE id = ? FOR UPDATE", [id]);
      if (!cur[0]) throw httpError(404, "Événement introuvable.");

      if (sets.length) await conn.query(`UPDATE events SET ${sets.join(", ")} WHERE id = ?`, [...values, id]);
      await setEventLinks(conn, b.slug ?? cur[0].slug, b.author_ids, b.book_ids);
      return getEvent(conn, id);
    });
  } catch (err) {
    throw eventDbError(err);
  }

  res.json(updated);
}));

app.delete("/api/admin/events/:id", requireAuth, adminWrite(async (req, res) => {
  const id = Number(req.params.id);
  if (!isId(id)) throw httpError(400, "Identifiant invalide.");
  const [r] = await db.query("DELETE FROM events WHERE id = ?", [id]);
  if (!r.affectedRows) throw httpError(404, "Événement introuvable.");
  res.json({ ok: true });
}));



// POST /api/newsletter → Inscription à la newsletter
app.post("/api/newsletter", route(async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim().toLowerCase();

  if (!name) {
    return res.status(400).json({ error: "Le nom et prénom sont obligatoires." });
  }
  if (!email || !emailOk(email)) {
    return res.status(400).json({ error: "Une adresse email valide est obligatoire." });
  }

  // 1. Vérification des doublons
  const [existing] = await db.query(
    "SELECT id, tags, unsubscribed FROM contacts WHERE email = ?",
    [email]
  );

  if (existing[0]) {
    const contact = existing[0];
    const tags = parseJson(contact.tags, []);

    if (tags.includes("newsletter") && !contact.unsubscribed) {
      return res.status(409).json({
        error: "Cette adresse email est déjà inscrite à notre lettre d'information.",
      });
    }

    const updatedTags = Array.from(new Set([...tags, "newsletter"]));
    await db.query(
      `UPDATE contacts 
       SET name = ?, tags = ?, unsubscribed = 0, consent_at = COALESCE(consent_at, NOW()) 
       WHERE id = ?`,
      [name, JSON.stringify(updatedTags), contact.id]
    );
  } else {
    await db.query(
      `INSERT INTO contacts (name, email, tags, consent_at, unsubscribed) 
       VALUES (?, ?, ?, NOW(), 0)`,
      [name, email, JSON.stringify(["newsletter"])]
    );
  }

  // 2. ENVOI DES NOTIFICATIONS (Lecteur & Administrateur)
  const contactData = { name, email };

  sendNewsletterWelcomeNotification(contactData).catch((err) =>
    console.error("Erreur envoi email bienvenue newsletter :", err.message)
  );

  sendNewsletterAdminNotification(contactData).catch((err) =>
    console.error("Erreur envoi notification admin newsletter :", err.message)
  );

  return res.status(201).json({
    ok: true,
    message: "Votre inscription à la lettre Hadithi a bien été enregistrée.",
  });
}));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));