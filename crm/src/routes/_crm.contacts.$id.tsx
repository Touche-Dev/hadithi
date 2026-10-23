import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Download, Mail, Pencil, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, Field, PageHeader, TextArea, TextInput } from "@/components/crm/ui";
import { useAppSelector, useMutate } from "@/store/hooks";
import { SOURCES, formatDate, formatDateTime } from "@/lib/labels";
import { contactTimeline } from "@/lib/timeline";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/_crm/contacts/$id")({
  head: () => ({
    meta: [
      { title: "Fiche contact · Hadithi CRM" },
      { name: "description", content: "Coordonnées, notes et chronologie d'un contact." },
      { property: "og:title", content: "Fiche contact · Hadithi CRM" },
      { property: "og:description", content: "Coordonnées, notes et chronologie d'un contact." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { id } = Route.useParams();
  const data = useAppSelector((s) => s.data);
  const contact = data.contacts.find((c) => c.id === Number(id));
  const mutate = useMutate();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState<"email" | "phone" | null>(null);

  const timeline = useMemo(() => (contact ? contactTimeline(data, contact.id) : []), [data, contact]);

  if (!contact)
    return (
      <div className="panel p-8 text-center text-muted-foreground">
        <p>Contact introuvable.</p>
        <Link to="/contacts" className="mt-2 inline-block text-primary underline">
          Retour aux contacts
        </Link>
      </div>
    );

  const save = async (patch: Record<string, unknown>, msg = "Contact mis à jour") => {
    await mutate((api: any) => api.updateContact(contact.id, patch));
    toast.success(msg);
  };

  const startEdit = () => {
    setForm({ name: contact.name, email: contact.email, phone: contact.phone ?? "" });
    setEditing(true);
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const line = `[${now}] ${note.trim()}`;
    await save({ notes: contact.notes ? `${contact.notes}\n\n${line}` : line }, "Note ajoutée");
    setNote("");
  };

  const copyToClipboard = (type: "email" | "phone", val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(type);
    toast.success(`${type === "email" ? "Email" : "Numéro"} copié !`);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportOne = () =>
    downloadCsv(
      `contact-${contact.id}-${contact.name.replace(/\s+/g, "_")}.csv`,
      ["Date", "Canal", "Intitulé", "Détail"],
      timeline.map((t) => [
        t.date.slice(0, 10),
        SOURCES.find((s) => s.value === t.source)?.label ?? t.source,
        t.title,
        t.detail ?? "",
      ]),
    );

  return (
    <>
      <button
        onClick={() => navigate({ to: "/contacts" })}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" /> Contacts
      </button>

      <PageHeader
        eyebrow={`Premier contact le ${formatDate(contact.created_at)}`}
        title={contact.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="size-3.5" /> Modifier
            </Button>
            <Button variant="outline" size="sm" onClick={exportOne}>
              <Download className="size-3.5" /> Exporter CSV
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne Gauche : Coordonnées et Notes */}
        <div className="space-y-6">
          <section className="panel space-y-4 p-5">
            <h2 className="subtitle text-base">Coordonnées</h2>

            {editing ? (
              <div className="space-y-4">
                <Field label="Nom">
                  <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Email">
                  <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Téléphone">
                  <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await save({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null });
                      setEditing(false);
                    }}
                  >
                    Enregistrer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="space-y-3.5 text-sm">
                <div>
                  <dt className="eyebrow flex items-center gap-1.5">
                    <Mail className="size-3.5" /> Email
                  </dt>
                  <dd className="mt-1 flex items-center justify-between">
                    <a href={`mailto:${contact.email}`} className="font-medium text-primary hover:underline">
                      {contact.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("email", contact.email)}
                      className="text-muted-foreground hover:text-primary transition-colors ml-2"
                      title="Copier l'email"
                    >
                      {copied === "email" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    </button>
                  </dd>
                </div>

                <div>
                  <dt className="eyebrow flex items-center gap-1.5">
                    <Phone className="size-3.5" /> Téléphone
                  </dt>
                  <dd className="mt-1 flex items-center justify-between">
                    {contact.phone ? (
                      <>
                        <a href={`tel:${contact.phone}`} className="font-medium hover:underline">
                          {contact.phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("phone", contact.phone!)}
                          className="text-muted-foreground hover:text-primary transition-colors ml-2"
                          title="Copier le téléphone"
                        >
                          {copied === "phone" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        </button>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Non renseigné</span>
                    )}
                  </dd>
                </div>

                <div className="border-t border-border pt-3">
                  <dt className="eyebrow">Consentement RGPD</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(contact.consent_at)}</dd>
                </div>
              </dl>
            )}

            <label className="flex items-center gap-2 border-t border-border pt-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={contact.unsubscribed === 1}
                onChange={(e) =>
                  save({ unsubscribed: e.target.checked ? 1 : 0 }, e.target.checked ? "Contact désinscrit" : "Contact réinscrit")
                }
                className="size-4 accent-primary cursor-pointer"
              />
              <span className={contact.unsubscribed === 1 ? "text-destructive font-medium" : "text-muted-foreground"}>
                Désinscrit (ne plus envoyer de communications)
              </span>
            </label>
          </section>

          {/* Notes internes */}
          <section className="panel space-y-3 p-5">
            <h2 className="subtitle text-base">Notes internes</h2>
            {contact.notes ? (
              <div className="bg-muted/40 p-3 rounded-sm border border-border text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {contact.notes}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>
            )}
            <TextArea placeholder="Ajouter une note de suivi…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            <Button size="sm" onClick={addNote} disabled={!note.trim()}>
              Ajouter la note
            </Button>
          </section>
        </div>

        {/* Colonne Droite : Chronologie */}
        <section className="lg:col-span-2">
          <div className="panel p-5">
            <h2 className="subtitle mb-5 text-lg">Chronologie des interactions</h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune interaction enregistrée pour ce contact.</p>
            ) : (
              <ol className="relative space-y-6 border-l border-border pl-6 ml-2">
                {timeline.map((t) => (
                  <li key={t.key} className="relative">
                    <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full border-2 border-background bg-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={t.source === "manuscrit" ? "navy" : "blue"}>
                        {SOURCES.find((s) => s.value === t.source)?.label ?? t.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDateTime(t.date)}</span>
                    </div>
                    <p className="mt-1 font-semibold text-primary">
                      {t.link ? (
                        <Link to={t.link.to} params={{ id: t.link.id }} className="hover:underline">
                          {t.title}
                        </Link>
                      ) : (
                        t.title
                      )}
                    </p>
                    {t.detail && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{t.detail}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </>
  );
}