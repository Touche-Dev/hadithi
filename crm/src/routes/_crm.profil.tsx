import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff, KeyRound, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, Field, PageHeader, TextInput } from "@/components/crm/ui";
import { changePassword } from "@/api/admin";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loggedOut, resetData } from "@/store/store";
import { formatDateTime } from "@/lib/labels";

export const Route = createFileRoute("/_crm/profil")({
  head: () => ({
    meta: [
      { title: "Profil · Hadithi CRM" },
      { name: "description", content: "Compte administrateur et sécurité." },
      { property: "og:title", content: "Profil · Hadithi CRM" },
      { property: "og:description", content: "Compte administrateur et sécurité." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleLogout = () => {
    dispatch(loggedOut());
    dispatch(resetData());
    navigate({ to: "/connexion" });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.current) {
      return setError("Veuillez renseigner votre mot de passe actuel.");
    }
    if (form.next.length < 10) {
      return setError("Le nouveau mot de passe doit comporter au moins 10 caractères.");
    }
    if (form.next === form.current) {
      return setError("Le nouveau mot de passe doit être différent de l'actuel.");
    }
    if (form.next !== form.confirm) {
      return setError("Les deux nouveaux mots de passe ne correspondent pas.");
    }

    setLoading(true);
    try {
      await changePassword(form.current, form.next);
      toast.success("Mot de passe mis à jour ! Veuillez vous reconnecter.");
      setForm({ current: "", next: "", confirm: "" });

      // Déconnexion propre après invalidation du token côté serveur
      setTimeout(() => {
        dispatch(loggedOut());
        dispatch(resetData());
        navigate({ to: "/connexion" });
      }, 1200);
    } catch (err) {
      setError((err as Error).message || "Impossible de modifier le mot de passe.");
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Sécurité & Compte" title="Mon Profil" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne Gauche (1/3) : Informations Administrateur */}
        <div className="space-y-6">
          <section className="panel p-6 space-y-5">
            <div className="flex items-center gap-4 border-b border-border pb-5">
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <User className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-primary text-base truncate">
                  {user?.name || "Administrateur"}
                </h2>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <div className="mt-2">
                  <Badge tone="navy" className="text-[10px]">
                    <ShieldCheck className="size-3 mr-1" />
                    {user?.role === "admin" ? "Administrateur général" : "Éditeur"}
                  </Badge>
                </div>
              </div>
            </div>

            <dl className="space-y-3.5 text-xs text-muted-foreground">
              <div>
                <dt className="eyebrow text-[10px]">Identifiant système</dt>
                <dd className="mt-0.5 font-mono text-primary font-medium">#{user?.id ?? "1"}</dd>
              </div>

              <div>
                <dt className="eyebrow text-[10px]">Statut de session</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-700 font-semibold">En ligne actuellement</span>
                </dd>
              </div>

              <div>
                <dt className="eyebrow text-[10px]">Dernière connexion enregistrée</dt>
                <dd className="mt-0.5 text-primary font-medium">
                  {user?.last_login_at ? formatDateTime(user.last_login_at) : "Aujourd'hui (session active)"}
                </dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-3.5 mr-1.5" /> Me déconnecter
              </Button>
            </div>
          </section>
        </div>

        {/* Colonne Droite (2/3) : Changement de mot de passe */}
        <div className="lg:col-span-2">
          <form onSubmit={submit} className="panel p-6 space-y-6" noValidate>
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <KeyRound className="size-5 text-primary" />
              <div>
                <h2 className="subtitle text-base">Changer de mot de passe</h2>
                <p className="text-xs text-muted-foreground">
                  Minimum 10 caractères pour protéger l'accès à la maison d'édition
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-lg">
              <Field label="Mot de passe actuel">
                <div className="relative">
                  <TextInput
                    type={showCurrent ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.current}
                    onChange={(e) => setForm({ ...form, current: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Nouveau mot de passe (10 caractères minimum)">
                <div className="relative">
                  <TextInput
                    type={showNext ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.next}
                    onChange={(e) => setForm({ ...form, next: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNext(!showNext)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Confirmer le nouveau mot de passe">
                <TextInput
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </Field>

              {form.next.length > 0 && (
                <div className="text-xs space-y-1 pt-1">
                  <p
                    className={
                      form.next.length >= 10 ? "text-emerald-600 font-medium" : "text-muted-foreground"
                    }
                  >
                    {form.next.length >= 10 ? "✓" : "○"} Au moins 10 caractères ({form.next.length}/10)
                  </p>
                  {form.confirm.length > 0 && (
                    <p
                      className={
                        form.next === form.confirm ? "text-emerald-600 font-medium" : "text-destructive"
                      }
                    >
                      {form.next === form.confirm ? "✓ Les deux mots de passe correspondent" : "✕ Les mots de passe ne correspondent pas"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive font-medium">
                {error}
              </p>
            )}

            <div className="pt-2 border-t border-border flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Mise à jour en cours…" : "Mettre à jour le mot de passe"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}