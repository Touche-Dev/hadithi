import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, Empty, PageHeader, Tabs, TextInput } from "@/components/crm/ui";
import { ConfirmDelete } from "@/components/crm/ConfirmDelete";
import { useAppSelector, useMutate } from "@/store/hooks";
import { formatDateTime } from "@/lib/labels";
import { isUpcoming, seatsTaken } from "@/lib/events";

export const Route = createFileRoute("/_crm/evenements/")({
  head: () => ({
    meta: [
      { title: "Événements · Hadithi CRM" },
      { name: "description", content: "Événements à venir et archives de Hadithi Publishers." },
      { property: "og:title", content: "Événements · Hadithi CRM" },
      { property: "og:description", content: "Événements à venir et archives de Hadithi Publishers." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const events = useAppSelector((s) => s.data.events);
  const regs = useAppSelector((s) => s.data.registrations);
  const mutate = useMutate();
  const [tab, setTab] = useState<"upcoming" | "archives">("upcoming");
  const [q, setQ] = useState("");

  const upcoming = events.filter((e) => isUpcoming(e.date));
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return events
      .filter((e) => (tab === "upcoming" ? isUpcoming(e.date) : !isUpcoming(e.date)))
      .filter((e) => !n || [e.title, e.city, e.venue, e.type].filter(Boolean).some((x) => x!.toLowerCase().includes(n)))
      .sort((a, b) => (tab === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  }, [events, tab, q]);

 
  const togglePublished = async (id: number, published: 0 | 1) => {
    try {
      await mutate((api) => api.updateEvent(id, { published }));
      toast.success(published ? "Événement publié" : "Événement repassé en brouillon");
    } catch (err) {
      toast.error((err as Error).message || "Impossible de modifier la visibilité");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={`${upcoming.length} à venir`}
        title="Événements"
        actions={
          <Button asChild>
            <Link to="/evenements/nouveau">
              <Plus /> Nouvel événement
            </Link>
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "upcoming" as const, label: `À venir (${upcoming.length})` },
          { value: "archives" as const, label: `Archives (${events.length - upcoming.length})` },
        ]}
      />
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-0 top-2.5 size-4 text-muted-foreground" />
        <TextInput className="pl-6" placeholder="Titre, ville, lieu…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" />
      </div>

      {rows.length === 0 ? (
        <Empty>Aucun événement.</Empty>
      ) : (
        <ul className="panel divide-y divide-border">
          {rows.map((e) => {
            const taken = seatsTaken(regs.filter((r) => r.event_slug === e.slug));
            return (
              <li key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">
                    {formatDateTime(e.date)} · {e.city}
                  </p>
                  <Link to="/evenements/$id" params={{ id: String(e.id) }} className="mt-1 block font-semibold hover:underline">
                    {e.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge tone="outline">{e.type}</Badge>
                    <span>
                      {taken} inscrit(s){e.capacity ? ` / ${e.capacity}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-primary" checked={e.published === 1} onChange={(ev) => togglePublished(e.id, ev.target.checked ? 1 : 0)} />
                    <Badge tone={e.published ? "success" : "muted"}>{e.published ? "Publié" : "Brouillon"}</Badge>
                  </label>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/evenements/$id/inscrits" params={{ id: String(e.id) }}>
                      <Users /> Inscrits
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild aria-label="Modifier">
                    <Link to="/evenements/$id" params={{ id: String(e.id) }}>
                      <Pencil />
                    </Link>
                  </Button>
                  <ConfirmDelete
                    title="Supprimer cet événement ?"
                    description={`« ${e.title} » et ses ${taken} inscription(s) seront définitivement supprimés.`}
                    onConfirm={async () => {
                      await mutate((api) => api.deleteEvent(e.id));
                      toast.success("Événement supprimé");
                    }}
                    trigger={
                      <Button variant="ghost" size="sm" aria-label="Supprimer" className="text-destructive">
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
