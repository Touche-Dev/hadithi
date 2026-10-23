import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Loader2, Pencil, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge, Empty, Field, PageHeader, Select, TextArea, TextInput } from "@/components/crm/ui";
import { ConfirmDelete } from "@/components/crm/ConfirmDelete";
import { useAppSelector, useMutate } from "@/store/hooks";
import { uploadFile } from "@/api/admin";

export const Route = createFileRoute("/_crm/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue des livres · Hadithi CRM" },
      { name: "description", content: "Gestion du catalogue des livres et publications de Hadithi Publishers." },
      { property: "og:title", content: "Catalogue des livres · Hadithi CRM" },
      { property: "og:description", content: "Gestion du catalogue des livres et publications de Hadithi Publishers." },
    ],
  }),
  component: CataloguePage,
});

const BOOK_FORMATS = ["Essai", "Mémoires & Trajectoires", "Cahiers", "Hors-série"] as const;
const BOOK_THEMES = [
  "Économie & développement",
  "Gouvernance & institutions",
  "Relations internationales",
  "Mémoires",
  "Jeunesse",
  "Récit",
] as const;
const AVAILABILITIES = ["Nouveauté", "Catalogue", "À paraître"] as const;
const COVER_TONES = [
  { value: "navy", label: "Bleu Nuit (Navy)" },
  { value: "warm", label: "Terre Chaude (Warm)" },
  { value: "blue", label: "Bleu Ciel (Blue)" },
  { value: "cream", label: "Crème (Cream)" },
] as const;

interface BookFormState {
  slug: string;
  title: string;
  author_slug: string;
  collection_id: string;
  format: string;
  theme: string;
  availability: string;
  price_euros: string;
  pages: string;
  isbn: string;
  cover_tone: "navy" | "warm" | "blue" | "cream";
  cover_url: string;
  history: string;
  why: string;
  is_published: boolean;
}

function CataloguePage() {
  const books = useAppSelector((s) => s.data.books);
  const authors = useAppSelector((s) => s.data.authors);
  const collections = useAppSelector((s) => s.data.collections);
  const mutate = useMutate();

  const [q, setQ] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editingBook, setEditingBook] = useState<BookFormState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const authorMap = useMemo(() => new Map(authors.map((a) => [a.slug, a.name])), [authors]);
  const collectionMap = useMemo(() => new Map(collections.map((c) => [c.id, c.name])), [collections]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return books
      .filter((b: any) => {
        const titleMatch = b.title?.toLowerCase().includes(search);
        const authorMatch = authorMap.get(b.author_slug)?.toLowerCase().includes(search);
        return !search || titleMatch || authorMatch;
      })
      .filter((b: any) => !collectionFilter || b.collection_id === collectionFilter)
      .filter((b: any) => {
        if (statusFilter === "published") return b.is_published === 1;
        if (statusFilter === "draft") return b.is_published === 0;
        return true;
      });
  }, [books, q, collectionFilter, statusFilter, authorMap]);

  const togglePublished = async (slug: string, currentPublished: number) => {
    const nextState = currentPublished === 1 ? 0 : 1;
    try {
      await mutate((api: any) => api.updateBook(slug, { published: nextState }));
      toast.success(nextState === 1 ? "Livre mis en ligne sur le site public !" : "Livre repassé en brouillon masqué.");
    } catch (err) {
      toast.error((err as Error).message || "Erreur de mise à jour");
    }
  };

  const openEditModal = (book: any) => {
    setEditingBook({
      slug: book.slug,
      title: book.title || "",
      author_slug: book.author_slug || (authors[0]?.slug ?? ""),
      collection_id: book.collection_id || (collections[0]?.id ?? ""),
      format: book.format || BOOK_FORMATS[0],
      theme: book.theme || BOOK_THEMES[0],
      availability: book.availability || "Catalogue",
      price_euros: book.price_cents ? (book.price_cents / 100).toFixed(2) : "19.90",
      pages: book.pages || "",
      isbn: book.isbn || "",
      cover_tone: book.cover_tone || "navy",
      cover_url: book.cover_url || "",
      history: book.history || "",
      why: book.why || "",
      is_published: book.is_published === 1,
    });
    setModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format non accepté. Veuillez choisir une image JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (5 Mo maximum).");
      return;
    }

    setUploadingCover(true);
    try {
      const res = await uploadFile(file);
      setEditingBook((prev) => (prev ? { ...prev, cover_url: res.url } : null));
      toast.success("Couverture téléversée avec succès !");
    } catch (err) {
      toast.error((err as Error).message || "Échec du téléversement");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title.trim()) return;

    setSaving(true);
    try {
      const priceCents = editingBook.price_euros
        ? Math.round(parseFloat(editingBook.price_euros.replace(",", ".")) * 100)
        : null;

      await mutate((api: any) =>
        api.updateBook(editingBook.slug, {
          title: editingBook.title.trim(),
          author_slug: editingBook.author_slug || null,
          collection_id: editingBook.collection_id,
          format: editingBook.format,
          theme: editingBook.theme,
          availability: editingBook.availability,
          price_cents: priceCents,
          pages: editingBook.pages.trim() || null,
          isbn: editingBook.isbn.trim() || null,
          cover_tone: editingBook.cover_tone,
          cover_url: editingBook.cover_url.trim() || null,
          history: editingBook.history.trim() || null,
          why: editingBook.why.trim() || null,
          is_published: editingBook.is_published ? 1 : 0,
        })
      );

      toast.success(`Livre « ${editingBook.title} » mis à jour.`);
      setModalOpen(false);
      setEditingBook(null);
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await mutate((api: any) => api.deleteBook(slug));
      toast.success("Livre supprimé du catalogue.");
    } catch (err) {
      toast.error((err as Error).message || "Impossible de supprimer ce livre.");
    }
  };

  return (
    <>
      <PageHeader eyebrow={`${books.length} titre(s) au catalogue`} title="Catalogue des livres" />

      {/* Barre de filtres */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <TextInput
            className="pl-9"
            placeholder="Titre, auteur…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)}>
          <option value="">Toutes les collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="published">Publiés (en ligne)</option>
          <option value="draft">Brouillons / À paraître</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty>Aucun livre ne correspond à ces critères.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book: any) => {
            const authorName = authorMap.get(book.author_slug) || book.author_slug || "Auteur inconnu";
            const colName = collectionMap.get(book.collection_id) || book.collection_id;
            const isPub = book.is_published === 1;

            return (
              <div
                key={book.slug}
                className="panel flex flex-col justify-between overflow-hidden group hover:border-primary transition-colors"
              >
                <div>
                  {/* Couverture */}
                  <div className="relative h-60 w-full bg-muted overflow-hidden flex items-center justify-center">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <BookOpen className="size-12 text-muted-foreground/30" />
                    )}

                    <div className="absolute top-2 right-2">
                      <Badge tone={isPub ? "success" : "muted"}>
                        {isPub ? "En ligne" : "Brouillon"}
                      </Badge>
                    </div>

                    <div className="absolute bottom-2 left-2">
                      <Badge tone="navy" className="text-[10px] bg-background/90 text-primary">
                        {book.availability || "Catalogue"}
                      </Badge>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="p-4 space-y-2">
                    <span className="eyebrow block text-xs">{colName}</span>
                    <h3 className="font-semibold text-primary line-clamp-2 leading-snug" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{authorName}</p>
                    {book.format && (
                      <span className="inline-block text-[11px] bg-muted px-2 py-0.5 rounded-xs text-muted-foreground">
                        {book.format}
                      </span>
                    )}
                  </div>
                </div>

                {/* Barre d'action inférieure */}
                <div className="p-4 pt-2 border-t border-border flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">
                      {book.price_cents ? `${(book.price_cents / 100).toFixed(2)} €` : "—"}
                    </span>

                    <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={isPub}
                        onChange={() => togglePublished(book.slug, book.is_published)}
                        className="size-4 accent-primary cursor-pointer"
                      />
                      <span>En ligne</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/50">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(book)}>
                      <Pencil className="size-3.5 mr-1" /> Modifier
                    </Button>

                    <ConfirmDelete
                      title="Supprimer ce livre ?"
                      description={`Êtes-vous sûr de vouloir supprimer « ${book.title} » du catalogue ?`}
                      onConfirm={() => handleDelete(book.slug)}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          title="Supprimer le livre"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
       *  MODALE ÉPURÉE SANS DÉBORDEMENT (SCROLL VERTICAL INTERNE STRICT)
       * ===================================================================== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border shrink-0">
            <DialogTitle className="font-display text-xl text-primary">
              Modifier la fiche du livre
            </DialogTitle>
          </DialogHeader>

          {editingBook && (
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                <Field label="Titre du livre">
                  <TextInput
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    required
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Auteur">
                    <Select
                      value={editingBook.author_slug}
                      onChange={(e) => setEditingBook({ ...editingBook, author_slug: e.target.value })}
                    >
                      <option value="">Sélectionner un auteur…</option>
                      {authors.map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {a.name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Collection">
                    <Select
                      value={editingBook.collection_id}
                      onChange={(e) => setEditingBook({ ...editingBook, collection_id: e.target.value })}
                      required
                    >
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Format">
                    <Select
                      value={editingBook.format}
                      onChange={(e) => setEditingBook({ ...editingBook, format: e.target.value })}
                    >
                      {BOOK_FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Thème">
                    <Select
                      value={editingBook.theme}
                      onChange={(e) => setEditingBook({ ...editingBook, theme: e.target.value })}
                    >
                      {BOOK_THEMES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Disponibilité">
                    <Select
                      value={editingBook.availability}
                      onChange={(e) => setEditingBook({ ...editingBook, availability: e.target.value })}
                    >
                      {AVAILABILITIES.map((av) => (
                        <option key={av} value={av}>
                          {av}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Prix public (€)">
                    <TextInput
                      type="number"
                      step="0.01"
                      value={editingBook.price_euros}
                      onChange={(e) => setEditingBook({ ...editingBook, price_euros: e.target.value })}
                      placeholder="19.90"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Pagination / Format papier">
                    <TextInput
                      value={editingBook.pages}
                      onChange={(e) => setEditingBook({ ...editingBook, pages: e.target.value })}
                      placeholder="Grand format, 224 pages"
                    />
                  </Field>

                  <Field label="ISBN">
                    <TextInput
                      value={editingBook.isbn}
                      onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                      placeholder="978-2-49123-..."
                    />
                  </Field>
                </div>

                {/* ZONE TÉLÉVERSEMENT DE COUVERTURE SÉCURISÉE SANS DÉBORDEMENT */}
                <div className="w-full space-y-2 border border-border p-3.5 rounded-sm bg-muted/20 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">Couverture du livre</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Teinte :</span>
                      <Select
                        value={editingBook.cover_tone}
                        onChange={(e) =>
                          setEditingBook({ ...editingBook, cover_tone: e.target.value as any })
                        }
                        className="text-xs py-0.5 h-7 w-32"
                      >
                        {COVER_TONES.map((ct) => (
                          <option key={ct.value} value={ct.value}>
                            {ct.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {editingBook.cover_url ? (
                    <div className="flex items-center justify-between gap-3 bg-card p-2 rounded-sm border border-border w-full overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                        <img
                          src={editingBook.cover_url}
                          alt="Couverture"
                          className="h-12 w-9 object-cover rounded-xs border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-primary truncate">Image enregistrée</p>
                          <p
                            className="text-[11px] text-muted-foreground truncate"
                            title={editingBook.cover_url}
                          >
                            {editingBook.cover_url}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingBook({ ...editingBook, cover_url: "" })}
                        className="p-1.5 text-muted-foreground hover:text-destructive shrink-0"
                        title="Retirer la couverture"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-border py-3.5 px-2 rounded-sm cursor-pointer hover:bg-muted/50 text-xs text-muted-foreground transition-colors w-full">
                      {uploadingCover ? (
                        <>
                          <Loader2 className="size-4 text-primary animate-spin" />
                          <span>Téléversement en cours…</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-4 text-primary" />
                          <span className="font-medium text-primary">Cliquez pour choisir une couverture</span>
                          <span className="text-[11px] text-muted-foreground">JPG, PNG ou WEBP (max 5 Mo)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploadingCover}
                        onChange={handleCoverUpload}
                      />
                    </label>
                  )}
                </div>

                <Field label="Histoire / Résumé éditorial">
                  <TextArea
                    rows={3}
                    value={editingBook.history}
                    onChange={(e) => setEditingBook({ ...editingBook, history: e.target.value })}
                    placeholder="Présentation résumée de l'ouvrage..."
                  />
                </Field>

                <Field label="Pourquoi ce livre ? (Note éditoriale)">
                  <TextArea
                    rows={2}
                    value={editingBook.why}
                    onChange={(e) => setEditingBook({ ...editingBook, why: e.target.value })}
                    placeholder="Pourquoi Hadithi a choisi de publier cet ouvrage..."
                  />
                </Field>

                <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editingBook.is_published}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, is_published: e.target.checked })
                    }
                    className="size-4 accent-primary cursor-pointer"
                  />
                  <span>Publié et visible immédiatement sur le site internet</span>
                </label>
              </div>

              {/* PIED DE MODALE FIXE */}
              <div className="flex justify-end gap-2 p-4 border-t border-border bg-card shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={saving || uploadingCover}>
                  {saving ? "Enregistrement…" : "Mettre à jour le livre"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}