import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/crm/AppShell";
import { Loading } from "@/components/crm/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadAll, loggedOut, resetData } from "@/store/store";
import { setUnauthorizedHandler } from "@/api/client";

const INACTIVITY_MS = 8 * 60 * 60 * 1000; // déconnexion après 8 h d'inactivité

export const Route = createFileRoute("/_crm")({
  component: CrmLayout,
});

function CrmLayout() {
  const token = useAppSelector((s) => s.auth.token);
  const status = useAppSelector((s) => s.data.status);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      navigate({ to: "/connexion", replace: true });
      return;
    }
    if (status === "idle") dispatch(loadAll());
  }, [hydrated, token, status, dispatch, navigate]);

  useEffect(() => {
    if (!token) return;
    const logout = (msg: string) => {
      dispatch(loggedOut());
      dispatch(resetData());
      toast.info(msg);
    };
    setUnauthorizedHandler(() => logout("Session expirée, veuillez vous reconnecter."));
    let timer = setTimeout(() => logout("Déconnecté après 8 h d'inactivité."), INACTIVITY_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => logout("Déconnecté après 8 h d'inactivité."), INACTIVITY_MS);
    };
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [token, dispatch]);

  if (!hydrated || !token) return <Loading />;

  return (
    <AppShell>
      {status === "ready" ? <Outlet /> : status === "error" ? <p className="text-destructive">Impossible de charger les données.</p> : <Loading />}
    </AppShell>
  );
}
