import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/crm/ui";
import { login } from "@/api/admin";
import { useAppDispatch } from "@/store/hooks";
import { loggedIn } from "@/store/store";
import logoWhite from "@/assets/logo/logo-white.png";


export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion · Hadithi CRM" },
      { name: "description", content: "Connexion au back-office de Hadithi Publishers." },
      { property: "og:title", content: "Connexion · Hadithi CRM" },
      { property: "og:description", content: "Connexion au back-office de Hadithi Publishers." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Renseignez votre email et votre mot de passe.");
    setLoading(true);
    try {
      const res = await login(email, password);
      dispatch(loggedIn(res));
      navigate({ to: "/tableau-de-bord" });
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(
        status === 401
          ? "Email ou mot de passe incorrect."
          : status === 429
            ? "Trop de tentatives. Réessayez dans quelques minutes."
            : "Connexion impossible pour le moment. Vérifiez votre réseau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="h-12 py-1 flex justify-center sm:justify-start">
          <img
            src={logoWhite}
            alt="Hadithi Publishers"
            className="h-full w-auto object-contain object-left"
            loading="eager"
            decoding="async"
          />
        </div>
        <blockquote className="max-w-md">
          <p className="font-display text-4xl leading-tight">Chaque histoire mérite une réponse.</p>
          <p className="eyebrow mt-4 !text-secondary">Espace réservé à l'équipe éditoriale</p>
        </blockquote>
        <p className="text-sm opacity-60">© Hadithi Publishers</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-8" noValidate>
          <div>
            <p className="eyebrow mb-2">Back-office</p>
            <h1 className="text-4xl text-primary">Connexion</h1>
          </div>
          <Field label="Email">
            <TextInput type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@hadithi.com" />
          </Field>
          <Field label="Mot de passe">
            <TextInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && (
            <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="bg-primary text-white shadow-[0_1px_2px_rgba(5,24,46,0.15)] text-[13px] cursor-pointer items-center justify-center gap-2 rounded-sm px-7 py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.14em] transition-all duration-250 ease-out focus-visible:outline-2 focus-visible:outline-offset-3 active:scale-[0.975] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
          
        </form>
      </div>
    </div>
  );
}
