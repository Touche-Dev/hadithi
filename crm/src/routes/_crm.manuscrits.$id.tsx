import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookPlus, Download, FileText, Lock, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge, DeadlineBadge, Field, PageHeader, Select, TextArea } from "@/components/crm/ui";
import { useAppSelector, useMutate } from "@/store/hooks";
import { MANUSCRIPT_STATUSES, formatDate, formatDateTime, manuscriptStatusLabel } from "@/lib/labels";
import { deadlineDate } from "@/lib/deadline";
import { FileUpload } from "@/components/crm/FileUpload";
import { MANUSCRIPT_FILE, formatSize } from "@/lib/upload";
import { uploadFile } from "@/api/admin";
import type { ManuscriptStatus } from "@/types";

export const Route = createFileRoute("/_crm/manuscrits/$id")({
  head: () => ({
    meta: [
      { title: "Fiche manuscrit · Hadithi CRM" },
      { name: "description", content: "Détail, décision et réponse pour un manuscrit." },
      { property: "og:title", content: "Fiche manuscrit · Hadithi CRM" },
      { property: "og:description", content: "Détail, décision et réponse pour un manuscrit." },
    ],
  }),
  component: ManuscriptPage,
});

const FINAL_STATUSES: ManuscriptStatus[] = ["accepte", "refuse", "a_retravailler"];

const BOOK_FORMATS = ["Essai", "Mémoires & Trajectoires", "Cahiers", "Hors-série"] as const;
const BOOK_THEMES = [
  "Économie & développement",
  "Gouvernance & institutions",
  "Relations internationales",
  "Mémoires",
  "Jeunesse",
  "Récit",
] as const;
const COVER_TONES = [
  { value: "navy", label: "Bleu Nuit (Navy)" },
  { value: "warm", label: "Terre Chaude (Warm)" },
  { value: "blue", label: "Bleu Ciel (Blue)" },
  { value: "cream", label: "Crème (Cream)" },
] as const;

function ManuscriptPage() {
  const { id } = Route.useParams();
  const m = useAppSelector((s) => s.data.manuscripts.find((x) => x.id === Number(id)));
  const contact = useAppSelector((s) => s.data.contacts.find((c) => c.id === m?.contact_id));
  const collections = useAppSelector((s) => s.data.collections);
  const books = useAppSelector((s) => s.data.books);
  // Vérifie si un livre porte déjà le même titre que ce manuscrit
  const isAlreadyConverted = books.some(
    (b) => b.title?.trim().toLowerCase() === m?.title?.trim().toLowerCase()
  );
  const mutate = useMutate();

  const [decision, setDecision] = useState("");

  // Modale "Convertir en livre"
  const [convertOpen, setConvertOpen] = useState(false);
  const [collectionId, setCollectionId] = useState("legacy");
  const [format, setFormat] = useState<(typeof BOOK_FORMATS)[number]>("Mémoires & Trajectoires");
  const [theme, setTheme] = useState<(typeof BOOK_THEMES)[number]>("Mémoires");
  const [coverTone, setCoverTone] = useState<"navy" | "warm" | "blue" | "cream">("navy");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    setDecision(m?.decision_note ?? "");
  }, [m?.id, m?.decision_note]);

  if (!m)
    return (
      <p className="text-muted-foreground">
        Manuscrit introuvable.{" "}
        <Link to="/manuscrits" className="underline">
          Retour aux manuscrits
        </Link>
      </p>
    );

  const isCurrentlyFinal = FINAL_STATUSES.includes(m.status);

  const save = async (patch: Record<string, unknown>, msg?: string) => {
    await mutate((api) => api.updateManuscript(m.id, patch));
    if (msg) toast.success(msg);
  };

  const handleStatusChange = async (newStatus: ManuscriptStatus) => {
    if (newStatus === m.status) return;
    const isMovingToFinal = FINAL_STATUSES.includes(newStatus);

    if (isCurrentlyFinal && !isMovingToFinal) {
      if (!window.confirm(`Ce dossier était clôturé (« ${manuscriptStatusLabel(m.status)} »). Voulez-vous vraiment le rouvrir et le passer en « ${manuscriptStatusLabel(newStatus)} » ?`)) return;
    }

    if (!isCurrentlyFinal && isMovingToFinal) {
      if (!window.confirm(`Confirmer la décision « ${manuscriptStatusLabel(newStatus)} » ?\n\nUn e-mail officiel sera envoyé à l'auteur (${contact?.email ?? "email indisponible"}).`)) return;
    }

    if (isCurrentlyFinal && isMovingToFinal) {
      if (!window.confirm(`Modifier la décision finale vers « ${manuscriptStatusLabel(newStatus)} » ?`)) return;
    }

    try {
      if (decision !== (m.decision_note ?? "")) {
        await save({ decision_note: decision.trim() || null });
      }
      await mutate((api) => api.updateManuscriptStatus(m.id, newStatus));
      toast.success(`Statut mis à jour : ${manuscriptStatusLabel(newStatus)}`);
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors du changement de statut");
    }
  };

  // Téléversement sécurisé de la couverture
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const res = await uploadFile(file);
      setCoverUrl(res.url);
      toast.success("Couverture téléversée avec succès");
    } catch (err) {
      toast.error((err as Error).message || "Échec du téléversement de la couverture");
    } finally {
      setCoverUploading(false);
    }
  };

  // Validation de la conversion en livre
  const submitConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setConverting(true);
    try {
      await mutate((api) =>
        api.convertManuscriptToBook(m.id, {
          collection_id: collectionId,
          format,
          theme,
          cover_tone: coverTone,
          cover_url: coverUrl || null,
          price_cents: 1990,
        })
      );
      toast.success(`Le livre « ${m.title} » a été créé au catalogue en mode Brouillon !`);
      setConvertOpen(false);
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors de la conversion en livre.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <>
      <Link to="/manuscrits" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Manuscrits
      </Link>
      <PageHeader
        eyebrow={`${m.genre} · reçu le ${formatDate(m.received_at)}`}
        title={m.title}
        actions={
          <>
            {m.file_url && (
              <Button variant="outline" asChild>
                <a href={m.file_url} target="_blank" rel="noreferrer">
                  <Download className="size-4" /> Télécharger le manuscrit
                </a>
              </Button>
            )}
            {/* Si le manuscrit est accepté */}
            {m.status === "accepte" && (
              isAlreadyConverted ? (
                <Button variant="outline" asChild className="border-green-600 text-green-700 bg-green-50 hover:bg-green-100">
                  <Link to="/catalogue">
                    ✓ Déjà au catalogue
                  </Link>
                </Button>
              ) : (
                <Button onClick={() => setConvertOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <BookPlus className="size-4" /> Convertir en livre
                </Button>
              )
            )}
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne Principale */}
        <div className="space-y-6 lg:col-span-2">
          <section className="panel space-y-2 p-5">
            <h2 className="subtitle text-base">Résumé du projet</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.summary}</p>
          </section>

          <section className="panel space-y-2 p-5">
            <h2 className="subtitle text-base">Présentation de l'auteur</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.author_bio || "Aucune biographie fournie."}</p>
          </section>

          <section className="panel space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="subtitle text-base">Réponse motivée</h2>
              <span className="text-xs text-muted-foreground">Incluse dans l'e-mail officiel</span>
            </div>
            <Field label="Texte explicatif à destination de l'auteur">
              <TextArea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="min-h-36"
                placeholder="Explications éditoriales, points forts du texte, raisons du refus ou pistes de travail à approfondir..."
              />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Button
                size="sm"
                onClick={() => save({ decision_note: decision.trim() || null }, "Réponse enregistrée")}
                disabled={decision === (m.decision_note ?? "")}
              >
                Enregistrer la réponse
              </Button>
              <p className="text-xs text-muted-foreground">
                Cette note sera transmise à l'auteur lors du passage en statut final (Accepté, Refusé ou À retravailler).
              </p>
            </div>
          </section>
        </div>

        {/* Colonne Latérale */}
        <aside className="space-y-6">
          <section className="panel space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Statut du manuscrit</span>
              {isCurrentlyFinal && <Lock className="size-3.5 text-muted-foreground" title="Dossier clôturé" />}
            </div>

            <Field label="">
              <Select
                value={m.status}
                onChange={(e) => handleStatusChange(e.target.value as ManuscriptStatus)}
                className="font-medium"
              >
                {MANUSCRIPT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="space-y-1 text-sm border-t border-border pt-3">
              <p className="eyebrow">Délai d'évaluation</p>
              <DeadlineBadge m={m} />
              <p className="text-xs text-muted-foreground">
                Date limite indicative : {formatDate(deadlineDate(m.received_at).toISOString())}
              </p>
              {m.answered_at && (
                <p className="text-xs text-muted-foreground font-medium pt-1">
                  Décision rendue le {formatDate(m.answered_at)}
                </p>
              )}
            </div>
          </section>

          <section className="panel space-y-4 p-5">
            <p className="eyebrow">Fichier du manuscrit</p>
            {m.file_url ? (
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block break-all font-semibold">{m.file_name ?? m.file_url.split("/").pop()}</span>
                    <span className="text-xs text-muted-foreground">{formatSize(m.file_size)}</span>
                  </span>
                </p>
                <Button size="sm" asChild className="w-full">
                  <a href={m.file_url} target="_blank" rel="noreferrer">
                    <Download className="size-4" /> Télécharger
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun fichier joint.</p>
            )}
            <FileUpload
              rule={MANUSCRIPT_FILE}
              label={m.file_url ? "Remplacer le fichier" : "Téléverser le fichier"}
              hasFile={!!m.file_url}
              onUploaded={(f) => save({ file_url: f.url, file_name: f.name, file_size: f.size }, "Fichier enregistré")}
            />
          </section>

          {contact && (
            <section className="panel space-y-2 p-5 text-sm">
              <p className="eyebrow">Auteur</p>
              <Link to="/contacts/$id" params={{ id: String(contact.id) }} className="font-semibold text-primary hover:underline block">
                {contact.name}
              </Link>
              <p className="text-muted-foreground">{contact.email}</p>
              <p className="text-muted-foreground">{contact.phone ?? "Pas de téléphone"}</p>
            </section>
          )}

          <section className="panel p-5">
            <p className="eyebrow mb-3">Historique des statuts</p>
            <ol className="space-y-2 text-sm">
              {[...m.status_history].reverse().map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <Badge tone={i === 0 ? "navy" : "outline"}>{manuscriptStatusLabel(h.status)}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDateTime(h.at)}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      {/* =====================================================================
       *  MODALE : CONVERTIR EN LIVRE DU CATALOGUE (SANS ERREUR)
       * ===================================================================== */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Convertir en livre du catalogue
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submitConvert} className="space-y-4 pt-2">
            <div className="bg-muted/50 p-3 rounded-sm text-xs space-y-1">
              <p><strong>Titre :</strong> {m.title}</p>
              <p><strong>Auteur :</strong> {contact?.name}</p>
              <p className="text-muted-foreground pt-1">
                Le livre sera créé en mode <strong>Brouillon (non publié)</strong> avec le statut <strong>« À paraître »</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Collection">
                <Select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} required>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Format">
                <Select value={format} onChange={(e) => setFormat(e.target.value as any)} required>
                  {BOOK_FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Thème">
                <Select value={theme} onChange={(e) => setTheme(e.target.value as any)} required>
                  {BOOK_THEMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Teinte dominante">
                <Select value={coverTone} onChange={(e) => setCoverTone(e.target.value as any)}>
                  {COVER_TONES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* Téléversement d'image simple et sans composant capricieux */}
            <div className="border border-border p-3 rounded-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">Couverture du livre</span>
                {coverUrl && <span className="text-[11px] text-green-600 font-medium">Image enregistrée</span>}
              </div>

              {coverUrl ? (
                <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-sm text-xs">
                  <img src={coverUrl} alt="Aperçu" className="size-10 object-cover rounded-sm border border-border" />
                  <span className="truncate flex-1 font-medium">Couverture personnalisée</span>
                  <button
                    type="button"
                    onClick={() => setCoverUrl(null)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Supprimer la couverture"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 border border-dashed border-border py-3 px-2 rounded-sm cursor-pointer hover:bg-muted/50 text-xs text-muted-foreground transition-colors">
                  <Upload className="size-4 text-primary" />
                  <span>{coverUploading ? "Téléversement en cours…" : "Choisir une image (JPG, PNG, WEBP)"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={coverUploading}
                    onChange={handleCoverUpload}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setConvertOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" size="sm" disabled={converting || coverUploading}>
                {converting ? "Création…" : "Créer le livre"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}