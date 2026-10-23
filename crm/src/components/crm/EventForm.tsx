import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea, TextInput } from "@/components/crm/ui";
import { FileUpload } from "@/components/crm/FileUpload";
import { MultiPicker } from "@/components/crm/MultiPicker";
import { useAppSelector } from "@/store/hooks";
import { EVENT_TYPES } from "@/lib/labels";
import { slugify } from "@/lib/events";
import { EVENT_IMAGE } from "@/lib/upload";
import type { CrmEvent } from "@/types";

export type EventInput = Omit<CrmEvent, "id">;

const toLocal = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function EventForm({ initial, submitLabel, onSubmit }: { initial?: CrmEvent; submitLabel: string; onSubmit: (v: EventInput) => Promise<void> }) {
  const authors = useAppSelector((s) => s.data.authors);
  const books = useAppSelector((s) => s.data.books);
  const [v, setV] = useState<EventInput>(
    initial ?? {
      slug: "",
      title: "",
      date: new Date(Date.now() + 14 * 86400000).toISOString(),
      city: "",
      venue: "",
      type: "Lancement",
      description: "",
      practical_info: "",
      img_url: null,
      capacity: null,
      published: 0,
      author_ids: [],
      book_ids: [],
    },
  );
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof EventInput>(k: K, val: EventInput[K]) => setV((p) => ({ ...p, [k]: val }));

  const valid = v.title.trim() && v.slug && v.city.trim() && v.date;

  return (
    <form
      className="grid max-w-3xl gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        setSaving(true);
        try {
          await onSubmit({ ...v, title: v.title.trim() });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Titre">
          <TextInput
            value={v.title}
            required
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug (adresse de la page)">
          <TextInput
            value={v.slug}
            required
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value) || e.target.value.toLowerCase());
            }}
          />
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Date et heure">
          <TextInput type="datetime-local" value={toLocal(v.date)} required onChange={(e) => e.target.value && set("date", new Date(e.target.value).toISOString())} />
        </Field>
        <Field label="Type">
          <Select value={v.type} onChange={(e) => set("type", e.target.value as EventInput["type"])}>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Capacité (optionnelle)">
          <TextInput
            type="number"
            min={1}
            value={v.capacity ?? ""}
            placeholder="Illimitée"
            onChange={(e) => set("capacity", e.target.value ? Math.max(1, Number(e.target.value)) : null)}
          />
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Ville">
          <TextInput value={v.city} required onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Lieu">
          <TextInput value={v.venue} onChange={(e) => set("venue", e.target.value)} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea value={v.description} onChange={(e) => set("description", e.target.value)} className="min-h-32" />
      </Field>
      <Field label="Informations pratiques">
        <TextArea value={v.practical_info} onChange={(e) => set("practical_info", e.target.value)} placeholder="Accès, horaires, tenue, contact sur place…" />
      </Field>

      <div className="panel space-y-3 p-5">
        {v.img_url && <img src={v.img_url} alt="Visuel de l'événement" className="aspect-video w-full max-w-sm rounded-sm border border-border object-cover" />}
        <FileUpload rule={EVENT_IMAGE} label="Image" hasFile={!!v.img_url} onUploaded={(f) => set("img_url", f.url)} />
        {v.img_url && (
          <button type="button" className="text-xs text-muted-foreground underline" onClick={() => set("img_url", null)}>
            Retirer l'image
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <MultiPicker
          label="Auteurs associés"
          placeholder="Rechercher un auteur…"
          options={authors.map((a) => ({ id: a.id, label: a.name }))}
          value={v.author_ids}
          onChange={(ids) => set("author_ids", ids)}
        />
        <MultiPicker
          label="Livres associés"
          placeholder="Rechercher un livre…"
          options={books.map((b) => ({ id: b.id, label: b.title }))}
          value={v.book_ids}
          onChange={(ids) => set("book_ids", ids)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-primary" checked={v.published === 1} onChange={(e) => set("published", e.target.checked ? 1 : 0)} />
        <span className="field-label">Publié sur le site</span>
      </label>

      <div>
        <Button type="submit" disabled={!valid || saving}>
          {saving ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
