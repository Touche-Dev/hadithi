import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/crm/ui";
import { EventForm } from "@/components/crm/EventForm";
import { useMutate } from "@/store/hooks";

export const Route = createFileRoute("/_crm/evenements/nouveau")({
  head: () => ({
    meta: [
      { title: "Nouvel événement · Hadithi CRM" },
      { name: "description", content: "Créer un événement Hadithi Publishers." },
      { property: "og:title", content: "Nouvel événement · Hadithi CRM" },
      { property: "og:description", content: "Créer un événement Hadithi Publishers." },
    ],
  }),
  component: NewEvent,
});

function NewEvent() {
  const mutate = useMutate();
  const navigate = useNavigate();
  return (
    <>
      <Link to="/evenements" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Événements
      </Link>
      <PageHeader title="Nouvel événement" />
      <EventForm
        submitLabel="Créer l'événement"
        onSubmit={async (v) => {
          try {
            await mutate((api) => api.createEvent(v));
            toast.success("Événement créé");
            navigate({ to: "/evenements" });
          } catch (e) {
            toast.error((e as Error).message);
          }
        }}
      />
    </>
  );
}
