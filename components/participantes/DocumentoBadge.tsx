"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertTriangle, ShieldOff } from "lucide-react";
import { useDocumentoDrop } from "@/hooks/useDocumentoDrop";
import { useDndActive } from "@/components/dnd/DndProvider";
import type { EstadoDocumento } from "@/lib/types";

// ── Configuración visual por estado ──────────────────────────────────────
const VARIANTES: Record<
  EstadoDocumento,
  { icon: React.ElementType; base: string; label: string }
> = {
  entregado: {
    icon: Check,
    base: "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    label: "Entregado",
  },
  pendiente: {
    icon: Clock,
    base: "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100",
    label: "Pendiente",
  },
  observado: {
    icon: AlertTriangle,
    base: "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100",
    label: "Observado",
  },
  exento: {
    icon: ShieldOff,
    base: "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100",
    label: "Exento",
  },
};

// ── Tipos ─────────────────────────────────────────────────────────────────
type Props = {
  estado: EstadoDocumento;
  inscripcionId: string;
  plantillaId: number;
  nombreDocumento: string;
  fechaEntrega?: Date | null;
  /** Opcional: PopoverTrigger asChild puede inyectar su propio onClick */
  onClick?: () => void;
};

/**
 * Badge 28×28 px con doble rol:
 *  1. Drop zone de @dnd-kit  → entrega por arrastre
 *  2. Trigger del DocumentoPopover → abre el panel de cambio de estado
 *
 * Usa `React.forwardRef` para que `<PopoverTrigger asChild>` pueda
 * fusionar su ref y sus event handlers sin generar un <button> anidado.
 * El elemento raíz es un <div role="button"> para evitar exactamente eso.
 */
const DocumentoBadge = React.forwardRef<
  HTMLDivElement,
  Props & React.HTMLAttributes<HTMLDivElement>
>(function DocumentoBadge(
  {
    estado,
    inscripcionId,
    plantillaId,
    nombreDocumento,
    fechaEntrega,
    onClick,
    // PopoverTrigger asChild puede inyectar estos:
    ...rest
  },
  forwardedRef,
) {
  const { isDragging } = useDndActive();

  // Drop zone — deshabilitado si ya está entregado o exento
  const deshabilitado = estado === "entregado" || estado === "exento";
  const { setNodeRef, isOver, canDrop } = useDocumentoDrop({
    inscripcionId,
    plantillaId,
    deshabilitado,
  });

  const variante = VARIANTES[estado];
  const Icon = variante.icon;

  // Fecha con hora
  const fechaStr = fechaEntrega
    ? new Date(fechaEntrega).toLocaleString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  const tooltip = fechaStr
    ? `${nombreDocumento} — ${variante.label} el ${fechaStr}`
    : `${nombreDocumento} — ${variante.label}`;

  // Fusionar la ref del DnD con la ref reenviada por PopoverTrigger
  const mergedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <div
      ref={mergedRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      title={tooltip}
      aria-label={tooltip}
      // Atributos data- para accesibilidad / tests
      data-drop-target="true"
      data-inscripcion-id={inscripcionId}
      data-plantilla-id={plantillaId}
      data-estado={estado}
      {...rest}
      className={cn(
        "relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded border",
        "select-none transition-all duration-150",
        variante.base,
        isDragging && !deshabilitado && "ring-1 ring-blue-200",
        canDrop && "ring-2 ring-dashed ring-blue-400 ring-offset-1",
        isOver &&
          canDrop &&
          "scale-110 border-blue-400 bg-blue-100 text-blue-600 ring-blue-500",
        deshabilitado && isDragging && "cursor-not-allowed",
        // Respetar className que pueda inyectar PopoverTrigger
        rest.className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />

      {/* Indicador visual al soltar */}
      {isOver && canDrop && (
        <span className="absolute inset-0 animate-ping rounded border-2 border-blue-400 opacity-50" />
      )}
    </div>
  );
});

DocumentoBadge.displayName = "DocumentoBadge";

export default DocumentoBadge;