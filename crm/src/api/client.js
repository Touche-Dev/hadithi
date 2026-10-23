import axios from "axios";

/**
 * Client HTTP unique du CRM.
 * baseURL lue dans VITE_API_URL. Le jeton JWT est gardé en mémoire uniquement
 * (jamais dans le code ni dans le localStorage) : un rechargement de page
 * déconnecte l'utilisateur.
 */
let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  // Pas de withCredentials : l'authentification passe par l'en-tête Bearer, pas par des cookies
});

// Ajoute le jeton à chaque requête
client.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// 401 sur une route protégée → session expirée ou invalide.
// On ignore /login : là, un 401 signifie « mauvais identifiants » et le message doit s'afficher.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLogin = error?.config?.url?.includes("/api/admin/login");
    if (error?.response?.status === 401 && !isLogin && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default client;