import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, FileText, LayoutDashboard, LogOut, Menu, UserCircle, Users, X, Library, CalendarDays, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loggedOut, resetData } from "@/store/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/catalogue", label: "Catalogue", icon: Library },
  {
  label: "Auteurs",
  to: "/auteurs",
  icon: UserCheck, // ou Users
},
  { to: "/manuscrits", label: "Manuscrits", icon: FileText },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/communaute", label: "Book Club & Academy", icon: BookOpen },
  { to: "/evenements", label: "Événements", icon: CalendarDays },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(loggedOut());
    dispatch(resetData());
    navigate({ to: "/connexion" });
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 pb-8 pt-7">
        <p className="font-display text-2xl leading-none">Hadithi</p>
        <p className="eyebrow mt-1 text-sidebar-primary">Publishers · CRM</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            activeProps={{ className: "bg-sidebar-accent !text-sidebar-foreground font-semibold" }}
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/profil"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          activeProps={{ className: "bg-sidebar-accent" }}
        >
          <UserCircle className="size-4" />
          <span className="truncate">{user?.email ?? "Profil"}</span>
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
          <LogOut className="size-4" /> Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <p className="font-display text-xl">Hadithi CRM</p>
        <button aria-label="Ouvrir le menu" onClick={() => setOpen(true)}>
          <Menu className="size-6" />
        </button>
      </header>
      <div className={cn("fixed inset-0 z-40 lg:hidden", open ? "" : "pointer-events-none")}>
        <div onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-primary/50 transition-opacity", open ? "opacity-100" : "opacity-0")} />
        <div className={cn("absolute inset-y-0 left-0 w-72 transition-transform", open ? "translate-x-0" : "-translate-x-full")}>
          <button aria-label="Fermer le menu" onClick={() => setOpen(false)} className="absolute right-3 top-6 z-10 text-sidebar-foreground">
            <X className="size-5" />
          </button>
          {sidebar}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}