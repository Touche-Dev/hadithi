import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Empty, PageHeader, Pager, Select, TextInput, paginate } from "@/components/crm/ui";
import { useAppSelector } from "@/store/hooks";
import { SOURCES, formatDate, type Source } from "@/lib/labels";
import { contactSources } from "@/lib/timeline";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/_crm/contacts/")({
  head: () => ({
    meta: [
      { title: "Contacts · Hadithi CRM" },
      { name: "description", content: "Base unique des contacts de Hadithi Publishers." },
      { property: "og:title", content: "Contacts · Hadithi CRM" },
      { property: "og:description", content: "Base unique des contacts de Hadithi Publishers." },
    ],
  }),
  component: ContactsPage,
});

const sourceLabel = (s: Source) => SOURCES.find((x) => x.value === s)?.label ?? s;

function ContactsPage() {
  const data = useAppSelector((s) => s.data);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);

  const sources = useMemo(() => contactSources(data), [data]);

  // Filtrage simple : Recherche texte + Source du site
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.contacts
      .filter((c) => {
        if (!needle) return true;
        return (
          c.name.toLowerCase().includes(needle) ||
          c.email.toLowerCase().includes(needle) ||
          (c.phone && c.phone.toLowerCase().includes(needle))
        );
      })
      .filter((c) => !source || sources.get(c.id)?.has(source as Source))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [data.contacts, q, source, sources]);

  // 25 contacts par page au lieu de 12
  const { rows, pages, page: p } = paginate(filtered, page, 25);

  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  const exportCsv = () =>
    downloadCsv(
      `contacts-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Nom", "Email", "Téléphone", "Canaux", "Consentement RGPD", "Désinscrit", "Date d'ajout"],
      filtered.map((c) => [
        c.name,
        c.email,
        c.phone ?? "",
        Array.from(sources.get(c.id) ?? []).map(sourceLabel).join(", "),
        c.consent_at?.slice(0, 10) ?? "",
        c.unsubscribed ? "oui" : "non",
        c.created_at.slice(0, 10),
      ]),
    );

  return (
    <>
      <PageHeader
        eyebrow={`${data.contacts.length} contact(s) au total`}
        title="Contacts"
        actions={
          <Button variant="outline" onClick={exportCsv}>
            <Download className="size-4" /> Exporter CSV
          </Button>
        }
      />

      {/* Barre d'action épurée : 2 champs au lieu de 4 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <TextInput
            className="pl-9"
            placeholder="Rechercher par nom, email, téléphone…"
            value={q}
            onChange={(e) => resetPage(setQ)(e.target.value)}
            aria-label="Rechercher"
          />
        </div>

        <Select value={source} onChange={(e) => resetPage(setSource)(e.target.value)} aria-label="Canal d'origine">
          <option value="">Tous les canaux du site</option>
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {rows.length === 0 ? (
        <Empty>Aucun contact ne correspond à votre recherche.</Empty>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="eyebrow px-4 py-3">Contact</th>
                <th className="eyebrow px-4 py-3">Canal d'interaction</th>
                <th className="eyebrow px-4 py-3">Premier contact</th>
                <th className="eyebrow px-4 py-3 text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => {
                const contactSourcesSet = Array.from(sources.get(c.id) ?? []);

                return (
                  <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/contacts/$id"
                          params={{ id: String(c.id) }}
                          className="font-semibold hover:underline text-primary"
                        >
                          {c.name}
                        </Link>
                        {c.unsubscribed === 1 && (
                          <Badge tone="outline" className="text-[10px]">
                            Désinscrit
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <span>{c.email}</span>
                        {c.phone && <span className="ml-2 font-mono">· {c.phone}</span>}
                      </div>
                    </td>

                    {/* Canaux réels du site */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {contactSourcesSet.length > 0 ? (
                          contactSourcesSet.map((s) => (
                            <Badge key={s} tone={s === "manuscrit" ? "navy" : "blue"}>
                              {sourceLabel(s)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/contacts/$id" params={{ id: String(c.id) }}>
                          Ouvrir →
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={p} pages={pages} total={filtered.length} onPage={setPage} />
    </>
  );
}