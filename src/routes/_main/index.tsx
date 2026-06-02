import { createFileRoute } from "@tanstack/react-router";
import { ModManagerPage } from "@/components/mods/mod-manager-page";

export const Route = createFileRoute("/_main/")({
  component: ModManagerPage,
});
