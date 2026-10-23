import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader } from "@/components/crm/ui";
import { useAppSelector, useContactMap, useMutate } from "@/store/hooks";
import { formatDate, formatDateTime } from "@/lib/labels";
import { seatsTaken } from "@/lib/events";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_crm/evenements/$id/inscrits")({
  head: () => ({
    meta: [
      { title: "Inscrits · Hadithi CRM" },
      { name: "description", content: "Liste des inscrits, présences et feuille d'émargement d'un événement." },
      { property: "og:title", content: "Inscrits · Hadithi CRM" },
      { property: "og:description", content: "Liste des inscrits, présences et feuille d'émargement d'un événement." },
    ],
  }),
  component: Registrants,
});


const escapeHtml = (s: unknown) => 
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function Registrants() {
  const { id } = Route.useParams();
  const e = useAppSelector((s) => s.data.events.find((x) => x.id === Number(id)));
  const all = useAppSelector((s) => s.data.registrations);
  const contacts = useContactMap();
  const mutate = useMutate();

  if (!e)
    return (
      <p className="text-muted-foreground">
        Événement introuvable.{" "}
        <Link to="/evenements" className="underline">
          Retour
        </Link>
      </p>
    );

  const regs = all
    .filter((r) => r.event_slug === e.slug)
    .map((r) => ({ ...r, contact: contacts.get(r.contact_id) }))
    .sort((a, b) => (a.contact?.name ?? "").localeCompare(b.contact?.name ?? ""));
  const taken = seatsTaken(regs);
  const present = regs.filter((r) => r.attended).length;
  const pct = e.capacity ? Math.min(100, (taken / e.capacity) * 100) : 0;

  const exportCsv = () =>
    downloadCsv(
      `inscrits-${e.slug}.csv`,
      ["Nom", "Email", "Téléphone", "Places", "Inscrit le", "Présent"],
      regs.map((r) => [r.contact?.name ?? "", r.contact?.email ?? "", r.contact?.phone ?? "", r.seats, r.created_at.slice(0, 10), r.attended ? "oui" : "non"]),
    );

  const printSheet = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = regs
      .map((r, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(r.contact?.name ?? "")}</td><td>${escapeHtml(r.contact?.email ?? "")}</td><td class="c">${r.seats}</td><td class="sig"></td></tr>`)
      .join("");
    w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Émargement · ${escapeHtml(e.title)}</title>
<style>body{font-family:Georgia,serif;color:#05182E;margin:32px}h1{font-size:22px;margin:0}p{margin:4px 0 20px;font-size:13px}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #DBD7D0;padding:8px;text-align:left}th{background:#F6F1EA}.c{text-align:center}.sig{width:30%;height:28px}</style></head>
<body><h1>${escapeHtml(e.title)}</h1><p>${escapeHtml(formatDateTime(e.date))} · ${escapeHtml(e.venue)}, ${escapeHtml(e.city)} — ${taken} place(s) réservée(s)</p>
<table><thead><tr><th>#</th><th>Nom</th><th>Email</th><th class="c">Places</th><th>Signature</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  return (
    <>
      <Link to="/evenements/$id" params={{ id }} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> {e.title}
      </Link>
      <PageHeader
        eyebrow={`${formatDate(e.date)} · ${e.city}`}
        title="Inscrits"
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} disabled={regs.length === 0}>
              <Download /> Export CSV
            </Button>
            <Button variant="outline" onClick={printSheet} disabled={regs.length === 0}>
              <Printer /> Feuille d'émargement
            </Button>
          </>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="eyebrow">Inscriptions</p>
          <p className="mt-3 font-display text-4xl text-primary">{regs.length}</p>
        </div>
        <div className="panel p-5">
          <p className="eyebrow">Places réservées</p>
          <p className="mt-3 font-display text-4xl text-primary">
            {taken}
            {e.capacity && <span className="text-xl text-muted-foreground"> / {e.capacity}</span>}
          </p>
          {e.capacity ? (
            <div className="mt-3 h-1.5 bg-muted" aria-label="Jauge de capacité">
              <div className={cn("h-1.5", pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-primary")} style={{ width: `${pct}%` }} />
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Capacité illimitée</p>
          )}
        </div>
        <div className="panel p-5">
          <p className="eyebrow">Présents</p>
          <p className="mt-3 font-display text-4xl text-primary">{present}</p>
        </div>
      </div>

      {regs.length === 0 ? (
        <Empty>Aucun inscrit pour le moment.</Empty>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Nom", "Email", "Places", "Inscrit le", "Présent"].map((h) => (
                  <th key={h} className="eyebrow px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {regs.map((r) => (
                <tr key={r.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    {r.contact ? (
                      <Link to="/contacts/$id" params={{ id: String(r.contact.id) }} className="font-semibold hover:underline">
                        {r.contact.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{r.contact?.email}</td>
                  <td className="px-4 py-3">{r.seats}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      aria-label={`Présent : ${r.contact?.name ?? ""}`}
                      checked={r.attended === 1}
                      onChange={(ev) => mutate((api) => api.updateRegistration(r.id, { attended: ev.target.checked ? 1 : 0 }))}
                    />
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
