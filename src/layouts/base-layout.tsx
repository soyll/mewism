"use client";

import { useRouterState } from "@tanstack/react-router";
import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";
import { PageTransition } from "@/components/layout/page-transition";
import { cn } from "@/utils/tailwind";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isOnboarding = pathname === "/onboarding";
  const isAppShell = pathname === "/" || pathname === "/settings";

  return (
    <div className="flex h-screen flex-col overflow-hidden [--titlebar-height:2.25rem]">
      <DragWindowRegion title="Mewism" />
      <main
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          !(isOnboarding || isAppShell) && "p-2 pb-4"
        )}
      >
        {isAppShell ? (
          children
        ) : (
          <PageTransition className="min-h-0 flex-1">{children}</PageTransition>
        )}
      </main>
    </div>
  );
}
