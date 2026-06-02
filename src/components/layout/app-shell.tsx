"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { Package, Play, Search, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import { ModInstallButton } from "@/components/mods/mod-install-button";
import { Input } from "@/components/ui/input";
import { MorphText } from "@/components/ui/morph-text";
import { MODS_QUERY_KEY } from "@/hooks/use-mods";
import { useGameLaunch } from "@/hooks/use-game-launch";
import { AppShellProvider, useAppShell } from "@/components/layout/app-shell-context";

function AppShellHeader() {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useAppShell();
  const { launch } = useGameLaunch();
  const queryClient = useQueryClient();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isModsPage = pathname === "/";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="size-8" />
      <div className="min-w-0 flex-1" />
      {isModsPage && (
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("ui.search_mods")}
            value={searchQuery}
          />
        </div>
      )}
      <ModInstallButton
        onInstalled={() => {
          queryClient.invalidateQueries({ queryKey: MODS_QUERY_KEY });
        }}
      />
      <Button hoverScale={1.03} onClick={() => launch()} size="sm">
        <Play className="h-4 w-4" />
        <MorphText>{t("ui.launch_game")}</MorphText>
      </Button>
    </header>
  );
}

function AppShellNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <Sidebar
      className="!top-[var(--titlebar-height)] !h-[calc(100svh-var(--titlebar-height))]"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="border-sidebar-border border-b">
        <div className="flex items-center gap-2 px-1 py-0.5">
          <span className="truncate font-semibold text-sm group-data-[collapsible=icon]:hidden">
            {t("window.app_title")}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  tooltip={t("ui.mods")}
                >
                  <Link to="/">
                    <Package />
                    <span>{t("ui.mods")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/settings"}
                  tooltip={t("menu.file.settings")}
                >
                  <Link to="/settings">
                    <Settings />
                    <span>{t("menu.file.settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-full min-h-0 flex-1">
      <AppShellNav />
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppShellHeader />
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppShellProvider>
  );
}
