import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  GraduationCap,
  Library,
  Plus,
  Users,
} from "lucide-react";
import { Badge, PageHeader } from "@/components/crm/ui";
import { Button } from "@/components/ui/button";
import { useAppSelector, useContactMap } from "@/store/hooks";
import { formatDate, formatDateTime } from "@/lib/labels";
import { seatsTaken } from "@/lib/events";

export const Route = createFileRoute("/_crm/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord · Hadithi CRM" },
      { name: "description", content: "Synthèse de l'activité éditoriale de Hadithi Publishers." },
      { property: "og:title", content: "Tableau de bord · Hadithi CRM" },
      { property: "og:description", content: "Synthèse de l'activité éditoriale de Hadithi Publishers." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const d = useAppSelector((s) => s.data);
  const contacts = useContactMap();

  // Nombre de manuscrits actuellement en cours de lecture ou comité
  const activeManuscripts = useMemo(
    () => d.manuscripts.filter((m) => !["accepte", "refuse", "a_retravailler"].includes(m.status)).length,
    [d.manuscripts]
  );

  // Événements à venir
  const upcomingEvents = useMemo(() => {
    return d.events
      .filter((e) => new Date(e.date).getTime() >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
      .map((e) => {
        const regs = d.registrations.filter((r) => r.event_slug === e.slug);
        return { ...e, taken: seatsTaken(regs) };
      });
  }, [d.events, d.registrations]);

  // Flux d'activité unifié (les 7 dernières actions)
  const feed = useMemo(() => {
    type ActivityItem = {
      key: string;
      date: string;
      type: "Manuscrit" | "Book Club" | "Academy" | "Événement";
      tone: "navy" | "blue" | "success" | "outline";
      who: string;
      label: string;
      link: { to: "/manuscrits/$id" | "/contacts/$id"; id: number };
    };

    const items: ActivityItem[] = [
      ...d.manuscripts.map((m) => ({
        key: `m-${m.id}`,
        date: m.received_at,
        type: "Manuscrit" as const,
        tone: "navy" as const,
        who: contacts.get(m.contact_id)?.name ?? "Auteur",
        label: m.title,
        link: { to: "/manuscrits/$id" as const, id: m.id },
      })),
      ...d.bookClub.map((b) => ({
        key: `b-${b.id}`,
        date: b.created_at,
        type: "Book Club" as const,
        tone: "blue" as const,
        who: contacts.get(b.contact_id)?.name ?? "Lecteur",
        label: "Inscription au Book Club",
        link: { to: "/contacts/$id" as const, id: b.contact_id },
      })),
      ...d.academy.map((a) => ({
        key: `a-${a.id}`,
        date: a.created_at,
        type: "Academy" as const,
        tone: "success" as const,
        who: contacts.get(a.contact_id)?.name ?? "Candidat",
        label: a.workshop,
        link: { to: "/contacts/$id" as const, id: a.contact_id },
      })),
      ...d.registrations.map((r) => {
        const ev = d.events.find((e) => e.slug === r.event_slug);
        return {
          key: `r-${r.id}`,
          date: r.created_at,
          type: "Événement" as const,
          tone: "outline" as const,
          who: contacts.get(r.contact_id)?.name ?? "Participant",
          label: `${r.seats} place(s) · ${ev?.title || r.event_slug}`,
          link: { to: "/contacts/$id" as const, id: r.contact_id },
        };
      }),
    ];

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  }, [d.manuscripts, d.bookClub, d.academy, d.registrations, d.events, contacts]);

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        title="Tableau de bord"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/manuscrits/nouveau">
                <Plus className="size-3.5" /> Manuscrit
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/evenements/nouveau">
                <Plus className="size-3.5" /> Événement
              </Link>
            </Button>
          </div>
        }
      />

      {/* --- CARTES DE STATISTIQUES GLOBALES --- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Link to="/manuscrits" className="panel group block p-4 hover:border-primary transition-colors">
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary">
            <span className="eyebrow">Manuscrits</span>
            <Clock className="size-4" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">{activeManuscripts}</p>
          <p className="mt-1 text-xs text-muted-foreground">en cours de lecture</p>
        </Link>

        <Link to="/catalogue" className="panel group block p-4 hover:border-primary transition-colors">
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary">
            <span className="eyebrow">Catalogue</span>
            <BookOpen className="size-4" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">{d.books.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">livres au total</p>
        </Link>

        <Link to="/auteurs" className="panel group block p-4 hover:border-primary transition-colors">
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary">
            <span className="eyebrow">Auteurs</span>
            <Library className="size-4" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">{d.authors.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">au catalogue</p>
        </Link>

        <Link to="/communaute" className="panel group block p-4 hover:border-primary transition-colors">
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary">
            <span className="eyebrow">Book Club</span>
            <Bookmark className="size-4" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">{d.bookClub.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">membres inscrits</p>
        </Link>

        <Link to="/communaute" className="panel group block p-4 hover:border-primary transition-colors">
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary">
            <span className="eyebrow">Academy</span>
            <GraduationCap className="size-4" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">{d.academy.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">candidatures</p>
        </Link>

        <Link to="/contacts" className="panel group block p-4 hover:border-primary transition-colors">
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary">
            <span className="eyebrow">Contacts</span>
            <Users className="size-4" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">{d.contacts.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">base totale</p>
        </Link>
      </div>

      {/* --- SECTIONS PRINCIPALES (2 COLONNES) --- */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Colonne GAUCHE (2/3) : Dernières interactions + Collections */}
        <div className="space-y-8 lg:col-span-2">
          {/* DERNIÈRES INTERACTIONS */}
          <section className="panel p-5">
            <h2 className="subtitle mb-4 text-base">Dernières interactions</h2>

            {feed.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucune activité enregistrée.</p>
            ) : (
              <ul className="divide-y divide-border">
                {feed.map((f) => (
                  <li key={f.key}>
                    <Link
                      to={f.link.to}
                      params={{ id: String(f.link.id) }}
                      className="flex items-center gap-3 px-2 py-3 text-sm hover:bg-muted/50 rounded-sm transition-colors group"
                    >
                      <Badge tone={f.tone} className="w-22 shrink-0 justify-center text-[10px]">
                        {f.type}
                      </Badge>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-primary truncate group-hover:underline">
                          {f.who}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{f.label}</p>
                      </div>

                      <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                        {formatDateTime(f.date)}
                      </span>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* COLLECTIONS & LIGNES ÉDITORIALES */}
          <section className="panel p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="subtitle text-base">Collections & Lignes éditoriales</h2>
              <Link to="/catalogue" className="text-xs font-semibold text-primary hover:underline">
                Voir tout le catalogue ({d.books.length}) →
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {d.collections.map((col) => {
                const colBooks = d.books.filter((b) => b.collection_id === col.id);
                const colPub = colBooks.filter((b) => b.is_published === 1).length;

                return (
                  <div key={col.id} className="rounded-sm border border-border p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-primary text-sm">{col.name}</p>
                        <span className="text-xs font-mono text-muted-foreground">{colBooks.length} livre(s)</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {col.tagline}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{colPub} en ligne</span>
                      <span>{colBooks.length - colPub} à paraître</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Colonne DROITE (1/3) : Raccourcis éditoriaux + Prochains événements */}
        <div className="space-y-6">
          {/* RACCOURCIS ÉDITORIAUX */}
          <section className="panel p-5 space-y-3">
            <h2 className="subtitle text-base">Raccourcis éditoriaux</h2>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" size="sm" asChild className="justify-start text-xs h-9">
                <Link to="/manuscrits/nouveau">
                  <Plus className="size-3.5 mr-1.5" /> Saisie Manuscrit
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="justify-start text-xs h-9">
                <Link to="/evenements/nouveau">
                  <Plus className="size-3.5 mr-1.5" /> Créer Événement
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="justify-start text-xs h-9">
                <Link to="/catalogue">
                  <BookOpen className="size-3.5 mr-1.5" /> Catalogue ({d.books.length})
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="justify-start text-xs h-9">
                <Link to="/auteurs">
                  <Library className="size-3.5 mr-1.5" /> Auteurs ({d.authors.length})
                </Link>
              </Button>
            </div>
          </section>

          {/* PROCHAINS ÉVÉNEMENTS */}
          <section className="panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                <h2 className="subtitle text-base">Prochains événements</h2>
              </div>
              <Link to="/evenements" className="text-xs text-muted-foreground hover:text-primary">
                Tous ({d.events.length})
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Aucun événement à venir.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((e) => (
                  <li key={e.slug} className="rounded-sm border border-border p-3 hover:border-primary/50 transition-colors">
                    <p className="eyebrow text-[10px]">
                      {formatDate(e.date)} · {e.city}
                    </p>
                    <Link
                      to="/evenements/$id"
                      params={{ id: String(e.id) }}
                      className="font-semibold text-sm hover:underline block mt-0.5"
                    >
                      {e.title}
                    </Link>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{e.taken} inscrit(s){e.capacity ? ` / ${e.capacity}` : ""}</span>
                      <Link
                        to="/evenements/$id/inscrits"
                        params={{ id: String(e.id) }}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        Émargement <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}