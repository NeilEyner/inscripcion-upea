"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DragData } from "./DndProvider";

type Props = {
  plantillaId: number;
  nombreDocumento: string;
  descripcion?: string | null;
  /** Si está deshabilitado (ya entregado globalmente, etc.) */
  disabled?: boolean;
};

/**
 * Chip arrastrable que representa un tipo de documento.
 * Se coloca en una barra lateral o panel de requisitos.
 * Al soltarlo sobre un DocumentoBadge con el mismo plantillaId,
 * el DndProvider ejecuta la Server Action.
 */
export default function DragDocumentoItem({
  plantillaId,
  nombreDocumento,
  descripcion,
  disabled = false,
}: Props) {
  const dragData: DragData = {
    type: "documento",
    plantillaId,
    nombreDocumento,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `drag-doc-${plantillaId}`,
    data: dragData,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    // Elevar z-index mientras se arrastra para no quedar bajo sticky headers
    zIndex: isDragging ? 9999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        // Layout
        "group flex cursor-grab items-start gap-2 rounded-md border px-3 py-2 text-left",
        "transition-all duration-150 select-none",
        // Colores base
        "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/60",
        // Dragging state
        isDragging && "opacity-30 cursor-grabbing border-blue-400",
        // Disabled state
        disabled && "cursor-not-allowed opacity-40"
      )}
      title={descripcion ?? nombreDocumento}
    >
      {/* Handle visual */}
      <GripVertical className="mt-0.5 size-3.5 shrink-0 text-slate-300 group-hover:text-slate-400" />

      <FileText
        className={cn(
          "mt-0.5 size-3.5 shrink-0",
          isDragging ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500"
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-700 group-hover:text-slate-900">
          {nombreDocumento}
        </p>
        {descripcion && (
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-400">
            {descripcion}
          </p>
        )}
      </div>
    </div>
  );
}