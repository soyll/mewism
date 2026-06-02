"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/tailwind";
import type { ModDto } from "@/types/mods";

export type ModListItem = {
  id: string;
  mod: ModDto;
};

type DraggableListProps = {
  items: ModListItem[];
  onReorder: (items: ModListItem[]) => void;
  onSelect?: (mod: ModDto) => void;
  selectedId?: string | null;
  className?: string;
};

function ModListRow({
  item,
  onSelect,
  selected,
}: {
  item: ModListItem;
  onSelect?: (mod: ModDto) => void;
  selected: boolean;
}) {
  const controls = useDragControls();
  const { mod } = item;

  const statusClass = mod.missing
    ? "border-red-500/60 text-red-400"
    : mod.has_unmet_requirements
      ? "border-orange-500/60 text-orange-300"
      : "";

  return (
    <Reorder.Item
      className={cn(
        "flex cursor-default items-center gap-3 rounded-lg border bg-(--card-bg) p-3",
        statusClass,
        selected && "ring-2 ring-primary/50"
      )}
      dragControls={controls}
      dragListener={false}
      key={item.id}
      value={item}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      }}
    >
      <button
        className="cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => controls.start(e)}
        type="button"
      >
        <GripVertical className="h-5 w-5 text-(--foreground)/40 hover:text-foreground" />
      </button>
      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => onSelect?.(mod)}
        type="button"
      >
        <div className="truncate font-medium text-sm">{mod.title}</div>
        <div className="truncate text-(--foreground)/60 text-xs">
          {mod.author} · v{mod.version}
        </div>
      </button>
    </Reorder.Item>
  );
}

export function DraggableList({
  items: initialItems,
  onReorder,
  onSelect,
  selectedId,
  className,
}: DraggableListProps) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  return (
    <Reorder.Group
      axis="y"
      className={cn("w-full space-y-2", className)}
      onReorder={(newOrder) => {
        setItems(newOrder);
        onReorder(newOrder);
      }}
      values={items}
    >
      {items.map((item) => (
        <ModListRow
          item={item}
          key={item.id}
          onSelect={onSelect}
          selected={selectedId === item.id}
        />
      ))}
    </Reorder.Group>
  );
}
