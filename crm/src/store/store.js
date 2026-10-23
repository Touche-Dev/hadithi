import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "../api/admin";
import { setAuthToken } from "../api/client";

/* ---------- Récupération sécurisée du jeton au rechargement (F5) ---------- */
const getSavedAuth = () => {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem("hadithi_token");
    const userStr = localStorage.getItem("hadithi_user");
    const user = userStr ? JSON.parse(userStr) : null;

    // Si un jeton existe déjà, on le réinjecte immédiatement dans le client HTTP
    if (token) {
      setAuthToken(token);
    }
    return { token, user };
  } catch (err) {
    console.error("Erreur lecture localStorage :", err);
    return { token: null, user: null };
  }
};

const savedAuth = getSavedAuth();

/* ---------- Auth (avec persistance de session) ---------- */
const authSlice = createSlice({
  name: "auth",
  initialState: { token: savedAuth.token, user: savedAuth.user },
  reducers: {
    loggedIn(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      setAuthToken(action.payload.token);

      // Sauvegarde dans le navigateur
      try {
        localStorage.setItem("hadithi_token", action.payload.token);
        localStorage.setItem("hadithi_user", JSON.stringify(action.payload.user));
      } catch (err) {
        console.error("Erreur écriture localStorage :", err);
      }
    },
    loggedOut(state) {
      state.token = null;
      state.user = null;
      setAuthToken(null);

      // Nettoyage lors de la déconnexion
      try {
        localStorage.removeItem("hadithi_token");
        localStorage.removeItem("hadithi_user");
      } catch (err) {
        console.error("Erreur suppression localStorage :", err);
      }
    },
  },
});

/* ---------- Données de référence, chargées au démarrage ---------- */
export const loadAll = createAsyncThunk("data/loadAll", async () => {
  const [contacts, manuscripts, bookClub, academy, registrations, events, collections, authors, books, stats] =
    await Promise.all([
      api.listContacts(),
      api.listManuscripts(),
      api.listBookClub(),
      api.listAcademy(),
      api.listRegistrations(),
      api.listEvents(),
      api.listCollections(),
      api.listAuthors(),
      api.listBooks(),
      api.getStats(),
    ]);
  return { contacts, manuscripts, bookClub, academy, registrations, events, collections, authors, books, stats };
});

/** Exécute une mutation puis rafraîchit le store. */
export const mutate = createAsyncThunk("data/mutate", async (fn, { dispatch }) => {
  const result = await fn(api);
  await dispatch(loadAll());
  return result;
});

const dataSlice = createSlice({
  name: "data",
  initialState: {
    status: "idle",
    error: null,
    contacts: [],
    manuscripts: [],
    bookClub: [],
    academy: [],
    registrations: [],
    events: [],
    collections: [],
    authors: [],
    books: [],
    stats: null,
  },
  reducers: {
    reset() {
      return dataSlice.getInitialState();
    },
  },
  extraReducers: (b) => {
    b.addCase(loadAll.pending, (s) => {
      if (s.status === "idle") s.status = "loading";
    });
    b.addCase(loadAll.fulfilled, (s, a) => ({ ...s, ...a.payload, status: "ready", error: null }));
    b.addCase(loadAll.rejected, (s, a) => {
      s.status = "error";
      s.error = a.error.message || "Erreur de chargement";
    });
  },
});

export const { loggedIn, loggedOut } = authSlice.actions;
export const { reset: resetData } = dataSlice.actions;

export const store = configureStore({
  reducer: { auth: authSlice.reducer, data: dataSlice.reducer },
  middleware: (gdm) => gdm({ serializableCheck: false }),
});