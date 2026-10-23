import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Loader2, Pencil, Plus, Search, Trash2, Upload, User, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge, Empty, Field, PageHeader, Select, TextArea, TextInput } from "@/components/crm/ui";
import { ConfirmDelete } from "@/components/crm/ConfirmDelete";
import { useAppSelector, useMutate } from "@/store/hooks";
import { uploadFile } from "@/api/admin";

export const Route = createFileRoute("/_crm/auteurs")({
  head: () => ({
    meta: [
      { title: "Auteurs du catalogue · Hadithi CRM" },
      { name: "description", content: "Gestion des auteurs publiés et figures du catalogue." },
      { property: "og:title", content: "Auteurs du catalogue · Hadithi CRM" },
      { property: "og:description", content: "Gestion des auteurs publiés et figures du catalogue." },
    ],
  }),
  component: AuthorsPage,
});

interface AuthorFormState {
  slug?: string;
  name: string;
  role: string;
  bio: string;
  img_url: string;
  is_published: boolean;
}

const emptyForm: AuthorFormState = {
  name: "",
  role: "",
  bio: "",
  img_url: "",
  is_published: true,
};

function AuthorsPage() {
  const authors = useAppSelector((s) => s.data.authors);
  const mutate = useMutate();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return authors
      .filter((a: any) => {
        const nameMatch = a.name?.toLowerCase().includes(search);
        const roleMatch = a.role?.toLowerCase().includes(search);
        return !search || nameMatch || roleMatch;
      })
      .filter((a: any) => {
        if (statusFilter === "published") return a.is_published === 1;
        if (statusFilter === "draft") return a.is_published === 0;
        return true;
      });
  }, [authors, q, statusFilter]);

  const openCreateModal = () => {
    setEditingAuthor(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (a: any) => {
    setEditingAuthor({
      slug: a.slug,
      name: a.name || "",
      role: a.role || "",
      bio: a.bio || "",
      img_url: a.img_url || "",
      is_published: a.is_published === 1,
    });
    setModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImg(true);
    try {
      const res = await uploadFile(file);
      setEditingAuthor((prev) => (prev ? { ...prev, img_url: res.url } : null));
      toast.success("Photo téléversée avec succès !");
    } catch (err) {
      toast.error((err as Error).message || "Échec du téléversement de la photo.");
    } finally {
      setUploadingImg(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor || !editingAuthor.name.trim()) return;

    setSaving(true);
    try {
      if (editingAuthor.slug) {
        await mutate((api: any) =>
          api.updateAuthor(editingAuthor.slug, {
            name: editingAuthor.name.trim(),
            role: editingAuthor.role.trim() || null,
            bio: editingAuthor.bio.trim() || null,
            img_url: editingAuthor.img_url.trim() || null,
            is_published: editingAuthor.is_published ? 1 : 0,
          })
        );
        toast.success(`Auteur « ${editingAuthor.name} » mis à jour.`);
      } else {
        await mutate((api: any) =>
          api.createAuthor({
            name: editingAuthor.name.trim(),
            role: editingAuthor.role.trim() || null,
            bio: editingAuthor.bio.trim() || null,
            img_url: editingAuthor.img_url.trim() || null,
            is_published: editingAuthor.is_published ? 1 : 0,
          })
        );
        toast.success(`Auteur « ${editingAuthor.name} » ajouté au catalogue.`);
      }
      setModalOpen(false);
      setEditingAuthor(null);
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (author: any) => {
    const nextState = author.is_published === 1 ? 0 : 1;
    try {
      await mutate((api: any) => api.updateAuthor(author.slug, { is_published: nextState }));
      toast.success(nextState === 1 ? "Auteur publié sur le site." : "Auteur masqué du site.");
    } catch (err) {
      toast.error((err as Error).message || "Erreur de mise à jour");
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await mutate((api: any) => api.deleteAuthor(slug));
      toast.success("Auteur retiré du catalogue.");
    } catch (err) {
      toast.error((err as Error).message || "Impossible de supprimer cet auteur.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={`${authors.length} auteur(s) officiel(s)`}
        title="Auteurs du Catalogue"
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="size-4" /> Nouvel auteur
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <TextInput
            className="pl-9"
            placeholder="Rechercher par nom, rôle…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="published">Visible sur le site (Publié)</option>
          <option value="draft">Brouillon (Masqué)</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty>Aucun auteur ne correspond à votre recherche.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((author: any) => {
            const isPub = author.is_published === 1;

            return (
              <div
                key={author.slug}
                className="panel flex flex-col justify-between overflow-hidden p-5 transition-colors hover:border-primary"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-full bg-muted border border-border flex items-center justify-center">
                      {author.img_url ? (
                        <img
                          src={author.img_url}
                          alt={author.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="size-8 text-muted-foreground/40" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-primary truncate" title={author.name}>
                          {author.name}
                        </h3>
                        <Badge tone={isPub ? "success" : "muted"}>
                          {isPub ? "En ligne" : "Masqué"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {author.role || "Auteur"}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="size-3.5" />
                        <span>{author.books_count ?? 0} livre(s) au catalogue</span>
                      </div>
                    </div>
                  </div>

                  {author.bio && (
                    <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
                      {author.bio}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={isPub}
                      onChange={() => togglePublished(author)}
                      className="size-4 accent-primary cursor-pointer"
                    />
                    <span>Visible</span>
                  </label>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(author)}>
                      <Pencil className="size-3.5" /> Modifier
                    </Button>

                    <ConfirmDelete
                      title="Supprimer cet auteur ?"
                      description={`Supprimer « ${author.name} » ? Cette action est possible uniquement si aucun livre ne lui est rattaché.`}
                      onConfirm={() => handleDelete(author.slug)}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          title="Supprimer"
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
       *  MODALE : BLINDÉE CONTRE LE DÉBORDEMENT HORIZONTAL ET VERTICAL
       * ===================================================================== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              {editingAuthor?.slug ? "Modifier la fiche auteur" : "Ajouter un auteur au catalogue"}
            </DialogTitle>
          </DialogHeader>

          {editingAuthor && (
            <form onSubmit={handleSave} className="space-y-4 pt-2 w-full max-w-full overflow-hidden">
              <Field label="Nom complet de l'auteur">
                <TextInput
                  value={editingAuthor.name}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })}
                  placeholder="Ex: Moussa Keïta"
                  required
                />
              </Field>

              <Field label="Titre / Rôle (affiché sous le nom)">
                <TextInput
                  value={editingAuthor.role}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, role: e.target.value })}
                  placeholder="Ex: Ancien diplomate, Économiste, Chercheuse..."
                />
              </Field>

              {/* ZONE PHOTO RÉSILIENTE AVEC TEXTE TRONQUÉ ET LARGEUR FIXÉE */}
              <div className="w-full space-y-2 border border-border p-3.5 rounded-sm bg-muted/20 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Photo de portrait</span>
                  {editingAuthor.img_url && (
                    <span className="text-[11px] text-emerald-600 font-medium">Photo enregistrée</span>
                  )}
                </div>

                {editingAuthor.img_url ? (
                  <div className="flex items-center justify-between gap-3 bg-card p-2.5 rounded-sm border border-border w-full max-w-full overflow-hidden">
                    <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                      <img
                        src={editingAuthor.img_url}
                        alt="Aperçu"
                        className="size-12 object-cover rounded-full border border-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs text-primary truncate">Portrait auteur</p>
                        <p
                          className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-[280px]"
                          title={editingAuthor.img_url}
                        >
                          {editingAuthor.img_url}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingAuthor({ ...editingAuthor, img_url: "" })}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-xs hover:bg-muted shrink-0"
                      title="Supprimer la photo"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border py-4 px-3 rounded-sm cursor-pointer hover:bg-muted/50 text-xs text-muted-foreground transition-colors w-full">
                    {uploadingImg ? (
                      <>
                        <Loader2 className="size-5 text-primary animate-spin" />
                        <span>Téléversement sur le serveur…</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-5 text-primary" />
                        <span className="font-medium text-primary">Cliquez pour choisir une photo</span>
                        <span className="text-[11px] text-muted-foreground">JPG, PNG ou WEBP (max 5 Mo)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingImg}
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>

              <Field label="Biographie officielle">
                <TextArea
                  rows={4}
                  value={editingAuthor.bio}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                  placeholder="Parcours, origines, réalisations clés, style ou engagement..."
                />
              </Field>

              <label className="flex items-center gap-2 pt-1 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingAuthor.is_published}
                  onChange={(e) =>
                    setEditingAuthor({ ...editingAuthor, is_published: e.target.checked })
                  }
                  className="size-4 accent-primary cursor-pointer"
                />
                <span>Publier et afficher sur le site internet dès maintenant</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={saving || uploadingImg}>
                  {saving ? "Enregistrement…" : editingAuthor.slug ? "Mettre à jour" : "Créer l'auteur"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}