import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Mail, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, Empty, PageHeader, Select, Tabs, TextInput } from "@/components/crm/ui";
import { ConfirmDelete } from "@/components/crm/ConfirmDelete";
import { useAppSelector, useContactMap, useMutate } from "@/store/hooks";
import { ACADEMY_STATUSES, WORKSHOPS, formatDate } from "@/lib/labels";
import { downloadCsv } from "@/lib/csv";
import type { AcademyStatus } from "@/types";

export const Route = createFileRoute("/_crm/communaute")({
  head: () => ({
    meta: [
      { title: "Book Club & Academy · Hadithi CRM" },
      { name: "description", content: "Inscrits au Book Club et demandes Hadithi Academy." },
      { property: "og:title", content: "Book Club & Academy · Hadithi CRM" },
      { property: "og:description", content: "Inscrits au Book Club et demandes Hadithi Academy." },
    ],
  }),
  component: CommunityPage,
});

const statusTone = { nouvelle: "navy", contactee: "blue", inscrit: "success", refusee: "outline" } as const;

function CommunityPage() {
  const [tab, setTab] = useState<"club" | "academy">("club");
  const club = useAppSelector((s) => s.data.bookClub.length);
  const academy = useAppSelector((s) => s.data.academy.length);

  return (
    <>
      <PageHeader eyebrow="Communauté" title="Book Club & Academy" />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "club", label: `Book Club (${club})` },
          { value: "academy", label: `Academy (${academy})` },
        ]}
      />
      {tab === "club" ? <BookClub /> : <Academy />}
    </>
  );
}

/* =====================================================================
 *  ONGLET 1 : BOOK CLUB
 * ===================================================================== */
function BookClub() {
  const members = useAppSelector((s) => s.data.bookClub);
  const collections = useAppSelector((s) => s.data.collections);
  const contacts = useContactMap();
  const mutate = useMutate();

  const [q, setQ] = useState("");
  const [col, setCol] = useState("");

  const colName = (id: string | null) => collections.find((c) => c.id === id)?.name ?? "Toutes collections";

  const rows = useMemo(() => {
    const search = q.trim().toLowerCase();
    return members
      .filter((m) => {
        const c = contacts.get(m.contact_id);
        if (!search) return true;
        return (
          c?.name.toLowerCase().includes(search) ||
          c?.email.toLowerCase().includes(search) ||
          (c?.phone && c.phone.toLowerCase().includes(search))
        );
      })
      .filter((m) => !col || (col === "toutes" ? m.collection_id === null : m.collection_id === col))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [members, col, q, contacts]);

  const exportCsv = () =>
    downloadCsv(
      `book-club-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Nom", "Email", "Téléphone", "Préférence Collection", "Inscrit le"],
      rows
        .filter((r) => !contacts.get(r.contact_id)?.unsubscribed)
        .map((r) => {
          const c = contacts.get(r.contact_id);
          return [
            c?.name ?? "",
            c?.email ?? "",
            c?.phone ?? "",
            colName(r.collection_id),
            r.created_at.slice(0, 10),
          ];
        }),
    );

  const removeMember = async (id: number) => {
    try {
      await mutate((api: any) => api.deleteBookClubMember(id));
      toast.success("Inscrit retiré du Book Club.");
    } catch (err) {
      toast.error((err as Error).message || "Erreur de suppression.");
    }
  };

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3 sm:items-end">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <TextInput
            className="pl-9"
            placeholder="Rechercher nom, email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={col} onChange={(e) => setCol(e.target.value)} aria-label="Collection préférée">
          <option value="">Toutes les préférences</option>
          <option value="toutes">Sans préférence spécifique</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <div className="flex sm:justify-end">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="size-4" /> Export lettre mensuelle
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>Aucun inscrit ne correspond à ces critères.</Empty>
      ) : (
        <ul className="panel divide-y divide-border">
          {rows.map((r) => {
            const c = contacts.get(r.contact_id);
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link to="/contacts/$id" params={{ id: String(r.contact_id) }} className="font-semibold text-primary hover:underline">
                      {c?.name}
                    </Link>
                    {c?.unsubscribed === 1 && (
                      <Badge tone="outline" className="text-[10px]">
                        Désinscrit
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{c?.email}</span>
                    {c?.phone && <span>· {c.phone}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge tone="blue">{colName(r.collection_id)}</Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</span>

                  <ConfirmDelete
                    title="Retirer cet inscrit ?"
                    description={`Retirer ${c?.name ?? "ce contact"} du Book Club ? Son profil contact sera conservé.`}
                    onConfirm={() => removeMember(r.id)}
                    trigger={
                      <button aria-label="Retirer" className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{rows.length} inscrit(s). Les contacts désinscrits sont automatiquement exclus de l'export CSV.</p>
    </>
  );
}

/* =====================================================================
 *  ONGLET 2 : HADITHI ACADEMY
 * ===================================================================== */
function Academy() {
  const requests = useAppSelector((s) => s.data.academy);
  const contacts = useContactMap();
  const mutate = useMutate();

  const [q, setQ] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(() => {
    const search = q.trim().toLowerCase();
    return requests
      .filter((r) => {
        const c = contacts.get(r.contact_id);
        if (!search) return true;
        return (
          c?.name.toLowerCase().includes(search) ||
          c?.email.toLowerCase().includes(search) ||
          r.project.toLowerCase().includes(search)
        );
      })
      .filter((r) => !workshop || r.workshop === workshop)
      .filter((r) => !status || r.status === status)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [requests, workshop, status, q, contacts]);

  const update = async (id: number, s: AcademyStatus) => {
    try {
      await mutate((api: any) => api.updateAcademy(id, { status: s }));
      toast.success(`Statut mis à jour : ${ACADEMY_STATUSES.find((x) => x.value === s)?.label}`);
    } catch (err) {
      toast.error((err as Error).message || "Erreur de mise à jour");
    }
  };

  const removeRequest = async (id: number) => {
    try {
      await mutate((api: any) => api.deleteAcademy(id));
      toast.success("Demande supprimée avec succès.");
    } catch (err) {
      toast.error((err as Error).message || "Erreur de suppression.");
    }
  };

  const exportCsv = () =>
    downloadCsv(
      `academy-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Nom", "Email", "Téléphone", "Atelier", "Projet", "Statut", "Reçue le"],
      rows.map((r) => {
        const c = contacts.get(r.contact_id);
        return [
          c?.name ?? "",
          c?.email ?? "",
          c?.phone ?? "",
          r.workshop,
          r.project,
          ACADEMY_STATUSES.find((x) => x.value === r.status)?.label ?? r.status,
          r.created_at.slice(0, 10),
        ];
      }),
    );

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <TextInput
            className="pl-9"
            placeholder="Candidat, projet…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={workshop} onChange={(e) => setWorkshop(e.target.value)} aria-label="Atelier">
          <option value="">Tous les ateliers</option>
          {WORKSHOPS.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </Select>

        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {ACADEMY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>

        <div className="flex sm:justify-end">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="size-4" /> Exporter CSV
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>Aucune demande ne correspond à ces critères.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => {
            const c = contacts.get(r.contact_id);
            return (
              <article key={r.id} className="panel flex flex-col justify-between p-5 hover:border-primary/50 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to="/contacts/$id" params={{ id: String(r.contact_id) }} className="font-semibold text-primary hover:underline">
                        {c?.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {c?.email}
                        </span>
                        {c?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge tone={statusTone[r.status]}>
                      {ACADEMY_STATUSES.find((s) => s.value === r.status)?.label}
                    </Badge>
                  </div>

                  <div className="mt-4 border-t border-border pt-3">
                    <p className="eyebrow text-xs">{r.workshop}</p>
                    <p className="mt-1 text-sm italic text-muted-foreground line-clamp-3">
                      « {r.project} »
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>

                  <div className="flex items-center gap-2">
                    <Select
                      value={r.status}
                      onChange={(e) => update(r.id, e.target.value as AcademyStatus)}
                      className="w-36 py-1 text-xs"
                      aria-label="Changer le statut"
                    >
                      {ACADEMY_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>

                    <ConfirmDelete
                      title="Supprimer cette demande ?"
                      description={`Supprimer définitivement la candidature de ${c?.name ?? "ce contact"} pour l'atelier « ${r.workshop} » ?`}
                      onConfirm={() => removeRequest(r.id)}
                      trigger={
                        <button
                          type="button"
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          title="Supprimer la demande"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}