import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hadithi CRM" },
      { name: "description", content: "Back-office privé de Hadithi Publishers." },
      { property: "og:title", content: "Hadithi CRM" },
      { property: "og:description", content: "Back-office privé de Hadithi Publishers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/tableau-de-bord" });
  },
});
