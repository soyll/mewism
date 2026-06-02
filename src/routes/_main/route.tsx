import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppContentTransition } from "@/components/layout/app-content-transition";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/_main")({
  component: MainLayout,
});

function MainLayout() {
  return (
    <AppShell>
      <AppContentTransition>
        <Outlet />
      </AppContentTransition>
    </AppShell>
  );
}
