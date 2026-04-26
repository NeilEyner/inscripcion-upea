"use client";

import { useTransition } from "react";
import {
  Check,
  Clock,
  AlertTriangle,
  ShieldOff,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { entregarTodosDocumentos } from "@/lib/actions/documentos.actions";
import DocumentoPopover from "./DocumentoPopover";
import type {
  ControlDocumento,
  PlantillaRequisito,
  EstadoDocumento,
} from "@/lib/types";

// ── Config visual ──────────────────────────────────────────────────────────
const CONFIG: Record<
  EstadoDocumento,
  { icon: React.ElementType; fila: string; badge: string; label: string }
> = {
  entregado: {
    icon: Check,
    fila: "border-emerald-100 bg-emerald-50/40",
    badge: "bg-emerald-100 text-emerald-700",
    label: "Entregado",
  },
  pendiente: {
    icon: Clock,
    // Faltantes se resaltan con borde rojo y fondo suave
    fila: "border-rose-200 bg-rose-50/60 ring-1 ring-rose-100",
    badge: "bg-rose-100 text-rose-700",
    label: "Pendiente",
  },
  observado: {
    icon: AlertTriangle,
    fila: "border-amber-200 bg-amber-50/50",
    badge: "bg-amber-100 text-amber-700",
    label: "Observado",
  },
  exento: {
    icon: ShieldOff,
    fila: "border-slate-100 bg-slate-50/50",
    badge: "bg-slate-100 text-slate-500",
    label: "Exento",
  },
};

// ── Props ──────────────────────────────────────────────────────────────────
type Props = {
  inscripcionId: string;
  requisitos: PlantillaRequisito[];
  documentos: ControlDocumento[];
};

export default function SeccionDocumentosFicha({
  inscripcionId,
  requisitos,
  documentos,
}: Props) {
  const [isPending, startTransition] = useTransition();

  // Índice O(1) plantillaId → doc
  const docIdx = Object.fromEntries(documentos.map((d) => [d.plantillaId, d]));

  const pendientes = requisitos.filter((r) => {
    const d = docIdx[r.id];
    return !d || d.estado === "pendiente";
  });

  const handleEntregarTodos = () => {
    if (pendientes.length === 0) return;
    startTransition(async () => {
      const result = await entregarTodosDocumentos(inscripcionId);
      if (result.success) {
        toast.success(result.mensaje);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Encabezado de sección */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Documentos requeridos
          </p>
          {pendientes.length > 0 ? (
            <p className="mt-0.5 text-xs font-medium text-rose-500">
              {pendientes.length} documento{pendientes.length > 1 ? "s" : ""}{" "}
              pendiente
              {pendientes.length > 1 ? "s" : ""}
            </p>
          ) : (
            <p className="mt-0.5 text-xs font-medium text-emerald-600">
              Todos los documentos entregados
            </p>
          )}
        </div>

        {/* Botón entrega masiva */}
        {pendientes.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-100"
            onClick={handleEntregarTodos}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <PackageCheck className="size-3" />
            )}
            Marcar todos
          </Button>
        )}
      </div>

      {/* Lista de documentos */}
      <div className="space-y-1.5">
        {requisitos.map((req) => {
          const doc = docIdx[req.id];
          const estado: EstadoDocumento = doc?.estado ?? "pendiente";
          const conf = CONFIG[estado];
          const Icon = conf.icon;

          const fechaStr = doc?.fechaEntrega
            ? new Date(doc.fechaEntrega).toLocaleString("es-BO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : null;

          return (
            <div
              key={req.id}
              className={cn(
                "flex items-start gap-3 rounded-md border px-3 py-2.5 transition-all",
                conf.fila,
              )}
            >
              {/* Ícono de estado */}
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  estado === "entregado" && "text-emerald-500",
                  estado === "pendiente" && "text-rose-400",
                  estado === "observado" && "text-amber-500",
                  estado === "exento" && "text-slate-400",
                )}
              />

              {/* Nombre y descripción */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-xs font-medium",
                    estado === "pendiente" ? "text-rose-700" : "text-slate-700",
                  )}
                >
                  {req.nombreDocumento}
                </p>
                {req.descripcionDetalle && (
                  <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                    {req.descripcionDetalle}
                  </p>
                )}
                {doc?.observaciones && (
                  <p className="mt-1 text-[10px] italic text-slate-500">
                    {doc.observaciones}
                  </p>
                )}
                {fechaStr && (
                  <p className="mt-0.5 text-[10px] text-emerald-600">
                    ✓ Entregado: {fechaStr}
                  </p>
                )}
              </div>

              {/* Badge de estado + Popover */}
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    conf.badge,
                  )}
                >
                  {conf.label}
                </span>

                <DocumentoPopover
                  inscripcionId={inscripcionId}
                  plantillaId={req.id}
                  nombreDocumento={req.nombreDocumento}
                  estadoActual={estado}
                  fechaEntrega={doc?.fechaEntrega ?? null}
                  observacionesActuales={doc?.observaciones ?? null}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
