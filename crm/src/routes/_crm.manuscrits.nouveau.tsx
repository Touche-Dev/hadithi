import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, PageHeader, Select, TextArea, TextInput } from "@/components/crm/ui";
import { FileUpload, type UploadedFile } from "@/components/crm/FileUpload";
import { useAppSelector, useMutate } from "@/store/hooks";
import { GENRES } from "@/lib/labels";
import { MANUSCRIPT_FILE, formatSize } from "@/lib/upload";
import type { Manuscript, ManuscriptGenre } from "@/types";

export const Route = createFileRoute("/_crm/manuscrits/nouveau")({
  head: () => ({
    meta: [
      { title: "Nouveau manuscrit · Hadithi CRM" },
      { name: "description", content: "Ajouter manuellement un manuscrit reçu hors du site." },
      { property: "og:title", content: "Nouveau manuscrit · Hadithi CRM" },
      { property: "og:description", content: "Ajouter manuellement un manuscrit reçu hors du site." },
    ],
  }),
  component: NewManuscript,
});

function NewManuscript() {
  const contacts = useAppSelector((s) => s.data.contacts);
  const mutate = useMutate();
  const navigate = useNavigate();

  const [contactId, setContactId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<ManuscriptGenre>("Essai");
  const [summary, setSummary] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [consent, setConsent] = useState(true);
  const [saving, setSaving] = useState(false);

  const newAuthor = contactId === "";
  const valid =
    title.trim() &&
    summary.trim() &&
    consent &&
    (!newAuthor || (name.trim() && /\S+@\S+\.\S+/.test(email)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    try {
      const m = (await mutate((api) =>
        api.createManuscript({
          contact_id: newAuthor ? null : Number(contactId),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          title: title.trim(),
          genre,
          summary: summary.trim(),
          author_bio: bio.trim(),
          file_url: file?.url ?? null,
          file_name: file?.name ?? null,
          file_size: file?.size ?? null,
          consent: true,
        }),
      )) as Manuscript;

      toast.success("Manuscrit ajouté avec succès");
      navigate({ to: "/manuscrits/$id", params: { id: String(m.id) } });
    } catch (err) {
      toast.error((err as Error).message || "Enregistrement impossible.");
      setSaving(false);
    }
  };

  return (
    <>
      <Link to="/manuscrits" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Manuscrits
      </Link>
      <PageHeader eyebrow="Saisie manuelle" title="Nouveau manuscrit" />

      <form onSubmit={submit} className="grid max-w-3xl gap-6">
        <Field label="Auteur">
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">Nouvel auteur…</option>
            {[...contacts]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.email}
                </option>
              ))}
          </Select>
        </Field>

        {newAuthor && (
          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Nom de l'auteur">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} required placeholder="Prénom Nom" />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="auteur@domaine.com" />
            </Field>
            <Field label="Téléphone (facultatif)">
              <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 ..." />
            </Field>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Titre de l'ouvrage">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Les sentiers de la diplomatie" />
          </Field>
          <Field label="Genre">
            <Select value={genre} onChange={(e) => setGenre(e.target.value as ManuscriptGenre)}>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Résumé ou note d'intention">
          <TextArea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            required
            placeholder="Présentez les thèmes centraux du manuscrit..."
          />
        </Field>

        <Field label="Présentation de l'auteur (bio)">
          <TextArea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Parcours, publications précédentes, expertise..."
          />
        </Field>

        <div className="panel space-y-3 p-5">
          <p className="eyebrow">Document du manuscrit (PDF, DOC, DOCX - max 10 Mo)</p>
          {file && (
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <FileText className="size-4 text-muted-foreground" />
              <span>{file.name}</span>
              <span className="text-xs text-muted-foreground">({formatSize(file.size)})</span>
            </p>
          )}
          <FileUpload rule={MANUSCRIPT_FILE} label="Téléverser le fichier" hasFile={!!file} onUploaded={setFile} />
        </div>

        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="size-4 accent-primary"
            required
          />
          L'auteur a consenti au traitement de ses données et à l'archivage de son manuscrit.
        </label>

        <div>
          <Button type="submit" disabled={!valid || saving}>
            {saving ? "Enregistrement…" : "Ajouter le manuscrit"}
          </Button>
        </div>
      </form>
    </>
  );
}