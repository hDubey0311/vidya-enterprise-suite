import { createFileRoute } from "@tanstack/react-router";
import { VidyaApp } from "@/components/vidya-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vidya Enterprise | Wholesale operations" },
      { name: "description", content: "Wholesale commerce and distribution workspace for Vidya Enterprise." },
      { property: "og:title", content: "Vidya Enterprise | Wholesale operations" },
      { property: "og:description", content: "A connected workspace for wholesale commerce and distribution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VidyaApp,
});