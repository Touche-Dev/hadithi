import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/crm/ui";
import { EventForm } from "@/components/crm/EventForm";
import { ConfirmDelete } from "@/components/crm/ConfirmDelete";
import { useAppSelector, useMutate } from "@/store/hooks";

export const Route = createFileRoute("/_crm/evenements/$id/")({
  head: () => ({
    meta: [
      { title: "Modifier l'événement · Hadithi CRM" },
      { name: "description", content: "Modifier un événement Hadithi Publishers." },
      { property: "og:title", content: "Modifier l'événement · Hadithi CRM" },
      { property: "og:description", content: "Modifier un événement Hadithi Publishers." },
    ],
  }),
  component: EditEvent,
});

function EditEvent() {
  const { id } = Route.useParams();
  const e = useAppSelector((s) => s.data.events.find((x) => x.id === Number(id)));
  const mutate = useMutate();
  const navigate = useNavigate();

  if (!e)
    return (
      <p className="text-muted-foreground">
        Événement introuvable.{" "}
        <Link to="/evenements" className="underline">
          Retour
        </Link>
      </p>
    );

  return (
    <>
      <Link to="/evenements" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Événements
      </Link>
      <PageHeader
        eyebrow={e.type}
        title={e.title}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/evenements/$id/inscrits" params={{ id }}>
                <Users /> Inscrits
              </Link>
            </Button>
            <ConfirmDelete
              title="Supprimer cet événement ?"
              description={`« ${e.title} » et ses inscriptions seront définitivement supprimés.`}
              onConfirm={async () => {
                try {
                  await mutate((api) => api.deleteEvent(e.id));
                  toast.success("Événement supprimé");
                  navigate({ to: "/evenements" });
                } catch (err) {
                  toast.error((err as Error).message || "Impossible de supprimer l'événement");
                }
              }}
              trigger={
                <Button variant="outline" className="text-destructive">
                  <Trash2 /> Supprimer
                </Button>
              }
            />
          </>
        }
      />
      <EventForm
        key={e.id}
        initial={e}
        submitLabel="Enregistrer"
        onSubmit={async (v) => {
          try {
            await mutate((api) => api.updateEvent(e.id, v));
            toast.success("Événement enregistré");
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
      />
    </>
  );
}
