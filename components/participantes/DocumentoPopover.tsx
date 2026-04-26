"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, AlertTriangle, ShieldOff, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { actualizarEstadoDocumento } from "@/lib/actions/documentos.actions";
import DocumentoBadge from "./DocumentoBadge";
import type { EstadoDocumento } from "@/lib/types";

// ── Config de botones de estado ──────────────────────────────────────────
const OPCIONES: {
  estado: EstadoDocumento;
  label: string;
  icon: React.ElementType;
  clase: string;
}[] = [
  {
    estado: "entregado",
    label: "Entregado",
    icon: Check,
    clase:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
  },
  {
    estado: "pendiente",
    label: "Pendiente",
    icon: Clock,
    clase:
      "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300",
  },
  {
    estado: "observado",
    label: "Observado",
    icon: AlertTriangle,
    clase:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300",
  },
  {
    estado: "exento",
    label: "Exento",
    icon: ShieldOff,
    clase:
      "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────
type Props = {
  inscripcionId: string;
  plantillaId: number;
  nombreDocumento: string;
  estadoActual: EstadoDocumento;
  fechaEntrega?: Date | null;
  observacionesActuales?: string | null;
};

/**
 * Popover de cambio rápido de estado de documento.
 *
 * Trigger = DocumentoBadge envuelto en <PopoverTrigger asChild>.
 * Gracias a que DocumentoBadge usa React.forwardRef y su raíz es un
 * <div role="button">, NO se genera un <button> anidado → sin error de
 * hidratación ni warning de DOM.
 *
 * PopoverTrigger asChild fusiona su ref y su onClick en el div del badge,
 * de modo que el contenido queda correctamente anclado al badge en pantalla.
 */
export default function DocumentoPopover({
  inscripcionId,
  plantillaId,
  nombreDocumento,
  estadoActual,
  fechaEntrega,
  observacionesActuales,
}: Props) {
  const [open, setOpen] = useState(false);
  const [observaciones, setObservaciones] = useState(
    observacionesActuales ?? "",
  );
  const [isPending, startTransition] = useTransition();

  const handleEstado = (estado: EstadoDocumento) => {
    startTransition(async () => {
      const result = await actualizarEstadoDocumento({
        inscripcionId,
        plantillaId,
        estado,
        observaciones: observaciones.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.mensaje);
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/*
        asChild hace que PopoverTrigger NO renderice su propio <button>.
        En cambio, clona DocumentoBadge (un <div role="button"> con forwardRef)
        y le inyecta ref + onClick para anclar y abrir el popover.
      */}
      <PopoverTrigger>
        <DocumentoBadge
          estado={estadoActual}
          inscripcionId={inscripcionId}
          plantillaId={plantillaId}
          nombreDocumento={nombreDocumento}
          fechaEntrega={fechaEntrega}
        />
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-0 shadow-lg"
        side="top"
        align="center"
        sideOffset={6}
      >
        {/* Encabezado */}
        <div className="px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Estado del documento
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-700">
            {nombreDocumento}
          </p>
          {fechaEntrega && (
            <p className="mt-1 text-[10px] text-slate-500">
              Entregado:{" "}
              <span className="font-medium text-slate-600">
                {new Date(fechaEntrega).toLocaleString('es-ES', {
                  weekday: 'long',
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          )}
        </div>

        <Separator />

        {/* Grid 2×2 de opciones */}
        <div className="grid grid-cols-2 gap-1.5 p-2">
          {OPCIONES.map(({ estado, label, icon: Icon, clase }) => {
            const isActive = estadoActual === estado;
            return (
              <button
                key={estado}
                onClick={() => handleEstado(estado)}
                disabled={isPending || isActive}
                className={[
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium",
                  "transition-all duration-100 disabled:cursor-not-allowed",
                  clase,
                  isActive ? "opacity-60 ring-2 ring-inset ring-current" : "",
                ].join(" ")}
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Icon className="size-3.5" />
                )}
                {label}
              </button>
            );
          })}
        </div>

        <Separator />

        {/* Textarea de observaciones */}
        <div className="p-2">
          <Textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones (opcional)…"
            className="min-h-15 resize-none text-xs"
            disabled={isPending}
          />
          <Button
            size="sm"
            variant="ghost"
            className="mt-1.5 h-7 w-full text-xs text-slate-500 hover:text-slate-800"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cerrar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
