import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Columns3, Lock, Plus, Rows3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge, DeadlineBadge, PageHeader, Select, TextInput } from "@/components/crm/ui";
import { useAppSelector, useContactMap, useMutate } from "@/store/hooks";
import { GENRES, MANUSCRIPT_STATUSES, formatDate, manuscriptStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Manuscript, ManuscriptStatus } from "@/types";

export const Route = createFileRoute("/_crm/manuscrits/")({
  head: () => ({
    meta: [
      { title: "Manuscrits · Hadithi CRM" },
      { name: "description", content: "Pipeline de suivi des manuscrits reçus." },
      { property: "og:title", content: "Manuscrits · Hadithi CRM" },
      { property: "og:description", content: "Pipeline de suivi des manuscrits reçus." },
    ],
  }),
  component: ManuscriptsPage,
});

const FINAL_STATUSES: ManuscriptStatus[] = ["accepte", "refuse", "a_retravailler"];

function ManuscriptsPage() {
  const manuscripts = useAppSelector((s) => s.data.manuscripts);
  const contacts = useContactMap();
  const mutate = useMutate();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState<ManuscriptStatus | null>(null);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return manuscripts
      .filter((m) => !n || m.title.toLowerCase().includes(n) || contacts.get(m.contact_id)?.name.toLowerCase().includes(n))
      .filter((m) => !genre || m.genre === genre)
      .filter((m) => !status || m.status === status)
      .sort((a, b) => a.received_at.localeCompare(b.received_at));
  }, [manuscripts, contacts, q, genre, status]);

  // Logique sécurisée de déplacement
  const move = async (id: number, to: ManuscriptStatus) => {
    const m = manuscripts.find((x) => x.id === id);
    if (!m || m.status === to) return;

    const isCurrentlyFinal = FINAL_STATUSES.includes(m.status);
    const isMovingToFinal = FINAL_STATUSES.includes(to);

    // Cas 1 : Le manuscrit est DÉJÀ clôturé et on veut le ré-ouvrir
    if (isCurrentlyFinal && !isMovingToFinal) {
      const confirmReopen = window.confirm(
        `Ce manuscrit a déjà fait l'objet d'une décision (« ${manuscriptStatusLabel(m.status)} »).\n\nSouhaitez-vous vraiment rouvrir ce dossier et le repasser en « ${manuscriptStatusLabel(to)} » ?`
      );
      if (!confirmReopen) return;
    }

    // Cas 2 : On bascule le manuscrit vers une décision finale (Accepté, Refusé, À retravailler)
    if (!isCurrentlyFinal && isMovingToFinal) {
      const confirmFinal = window.confirm(
        `Confirmer la décision « ${manuscriptStatusLabel(to)} » pour l'ouvrage « ${m.title} » ?\n\nUn e-mail de notification officiel sera envoyé à l'auteur.`
      );
      if (!confirmFinal) return;
    }

    // Cas 3 : Changement entre deux statuts finaux (ex: d'accepté à refusé)
    if (isCurrentlyFinal && isMovingToFinal) {
      const confirmSwitch = window.confirm(
        `Modifier la décision finale de « ${manuscriptStatusLabel(m.status)} » vers « ${manuscriptStatusLabel(to)} » ?\n\nUn nouvel e-mail sera envoyé à l'auteur.`
      );
      if (!confirmSwitch) return;
    }

    try {
      await mutate((api) => api.updateManuscriptStatus(id, to));
      toast.success(`« ${m.title} » → ${manuscriptStatusLabel(to)}`);
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors du changement de statut");
    }
  };

  const Card = ({ m }: { m: Manuscript }) => {
    const isFinal = FINAL_STATUSES.includes(m.status);

    return (
      <Link
        to="/manuscrits/$id"
        params={{ id: String(m.id) }}
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", String(m.id))}
        className={cn(
          "block cursor-grab rounded-sm border border-border bg-card p-3 text-sm transition-colors hover:border-primary active:cursor-grabbing",
          isFinal && "border-l-4 border-l-primary/60 bg-muted/40"
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <p className="font-semibold leading-snug">{m.title}</p>
          {isFinal && (
            <span title="Dossier clôturé">
              <Lock className="size-3.5 shrink-0 text-muted-foreground" />
            </span>
          )}
        </div>
        <p className="mt-0.5 text-muted-foreground">{contacts.get(m.contact_id)?.name}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge tone="outline">{m.genre}</Badge>
          <DeadlineBadge m={m} />
        </div>
      </Link>
    );
  };

  return (
    <>
      <PageHeader
        eyebrow={`${manuscripts.length} manuscrits`}
        title="Manuscrits"
        actions={
          <>
            <Button asChild>
              <Link to="/manuscrits/nouveau">
                <Plus /> Ajouter un manuscrit
              </Link>
            </Button>
            <div className="flex rounded-sm border border-border">
              {(
                [
                  ["kanban", Columns3, "Kanban"],
                  ["table", Rows3, "Tableau"],
                ] as const
              ).map(([v, Icon, label]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 text-sm", view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-0 top-2.5 size-4 text-muted-foreground" />
          <TextInput className="pl-6" placeholder="Titre ou auteur" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" />
        </div>
        <Select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Genre">
          <option value="">Tous les genres</option>
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </Select>
        {view === "table" && (
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {MANUSCRIPT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      {view === "kanban" ? (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
          {MANUSCRIPT_STATUSES.map((col) => {
            const items = filtered.filter((m) => m.status === col.value);
            const isFinalCol = FINAL_STATUSES.includes(col.value);

            return (
              <div
                key={col.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col.value);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  move(Number(e.dataTransfer.getData("text/plain")), col.value);
                }}
                className={cn(
                  "flex w-64 shrink-0 flex-col rounded-sm border border-transparent bg-muted p-2 transition-colors",
                  dragOver === col.value && "border-primary bg-accent",
                  isFinalCol && "bg-muted/60"
                )}
              >
                <div className="flex items-center justify-between px-1 pb-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="subtitle text-sm">{col.label}</span>
                    {isFinalCol && <Lock className="size-3 text-muted-foreground" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="flex min-h-24 flex-col gap-2">
                  {items.map((m) => (
                    <Card key={m.id} m={m} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Titre", "Auteur", "Genre", "Reçu le", "Statut", "Délai"].map((h) => (
                  <th key={h} className="eyebrow px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <Link to="/manuscrits/$id" params={{ id: String(m.id) }} className="font-semibold hover:underline">
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{contacts.get(m.contact_id)?.name}</td>
                  <td className="px-4 py-3">{m.genre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.received_at)}</td>
                  <td className="px-4 py-3">
                    <Select value={m.status} onChange={(e) => move(m.id, e.target.value as ManuscriptStatus)} className="py-1 text-sm" aria-label="Changer le statut">
                      {MANUSCRIPT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <DeadlineBadge m={m} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}