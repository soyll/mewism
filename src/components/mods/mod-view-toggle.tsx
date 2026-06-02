"use client";

import { LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ModViewMode } from "@/types/mods";

const STORAGE_KEY = "mewism-view-mode";

export function getStoredViewMode(): ModViewMode {
  if (typeof window === "undefined") {
    return "list";
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "grid" ? "grid" : "list";
}

export function setStoredViewMode(mode: ModViewMode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

type ModViewToggleProps = {
  value: ModViewMode;
  onChange: (mode: ModViewMode) => void;
};

export function ModViewToggle({ value, onChange }: ModViewToggleProps) {
  return (
    <ToggleGroup
      onValueChange={(v) => {
        if (v === "list" || v === "grid") {
          onChange(v);
          setStoredViewMode(v);
        }
      }}
      type="single"
      value={value}
    >
      <ToggleGroupItem aria-label="List view" value="list">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Grid view" value="grid">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
