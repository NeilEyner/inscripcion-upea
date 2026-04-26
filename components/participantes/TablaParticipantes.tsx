"use client";

import { useCallback, useMemo, useState, type ComponentType } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FileText, ArrowUpDown, Users, UserPlus } from "lucide-react";
import DndProvider from "@/components/dnd/DndProvider";
import DragDocumentoItem from "@/components/dnd/DragDocumentoItem";
import FilaParticipante from "./FilaParticipante";
import FichaParticipanteSheet from "./FichaParticipanteSheet";
import NuevaInscripcionSheet from "./NuevaInscripcionSheet";

const FilaParticipanteAny = FilaParticipante as ComponentType<any>;
import type {
  InscripcionDetalle,
  ControlDocumento,
  PlantillaRequisito,
  Pago,
} from "@/lib/types";

type Props = {
  sesionId: string;
  inscripciones: InscripcionDetalle[];
  requisitos: PlantillaRequisito[];
  documentosMap: Record<string, ControlDocumento[]>;
  /** Mapa inscripcionId → pagos[] para la ficha del participante */
  pagosMap: Record<string, Pago[]>;
};

type Orden = "nombre" | "estado" | "progreso";

export default function TablaParticipantes({
  sesionId,
  inscripciones,
  requisitos,
  documentosMap,
  pagosMap,
}: Props) {
  const [orden, setOrden] = useState<Orden>("nombre");
  const [fichaAbierta, setFichaAbierta] = useState<InscripcionDetalle | null>(
    null,
  );
  const [nuevaOpen, setNuevaOpen] = useState(false);

  // Ordenamiento local sin roundtrip
  const inscritos = useMemo(() => {
    return [...inscripciones].sort((a, b) => {
      if (orden === "nombre")
        return a.nombreCompleto.localeCompare(b.nombreCompleto, "es");
      if (orden === "estado")
        return a.estadoInscripcion.localeCompare(b.estadoInscripcion);
      if (orden === "progreso") {
        const resA = (documentosMap[a.id] ?? []).filter((d) =>
          ["entregado", "exento"].includes(d.estado),
        ).length;
        const resB = (documentosMap[b.id] ?? []).filter((d) =>
          ["entregado", "exento"].includes(d.estado),
        ).length;
        return resB - resA;
      }
      return 0;
    });
  }, [inscripciones, orden, documentosMap]);

  const toggleOrden = useCallback(
    (campo: Orden) => setOrden((prev) => (prev === campo ? "nombre" : campo)),
    [],
  );

  return (
    <TooltipProvider>
      {/* ── Tabla principal ───────────────────────────────────────── */}
      <div className="min-w-0 w-full space-y-2">
        {/* Barra superior de acciones */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {inscritos.length} participante{inscritos.length !== 1 ? "s" : ""}
          </p>
          <Button
            size="sm"
            className="h-7 gap-1.5 bg-blue-600 text-xs text-white hover:bg-blue-700"
            onClick={() => setNuevaOpen(true)}
          >
            <UserPlus className="size-3.5" />
            Nueva inscripción
          </Button>
        </div>

        {inscritos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-200 py-20 text-slate-400">
            <Users className="size-10 opacity-30" />
            <p className="text-sm">Sin participantes registrados.</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setNuevaOpen(true)}
            >
              <UserPlus className="size-3.5" />
              Inscribir participante
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 py-2.5 pl-3 pr-4 text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => toggleOrden("nombre")}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Participante
                      <ArrowUpDown className="size-3 opacity-50" />
                    </button>
                  </th>
                  <th className="px-2 py-2.5 text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => toggleOrden("estado")}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Estado
                      <ArrowUpDown className="size-3 opacity-50" />
                    </button>
                  </th>
                  <th className="px-2 py-2.5 text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => toggleOrden("progreso")}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Docs
                      <ArrowUpDown className="size-3 opacity-50" />
                    </button>
                  </th>

                  {/* Columnas dinámicas */}
                  {requisitos.map((req) => (
                    <th key={req.id} className="px-1.5 py-2.5 text-center">
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="block max-w-8 cursor-help overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-semibold text-slate-500">
                            {req.nombreDocumento
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 4)
                              .toUpperCase()}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-50 text-xs">
                          <p className="font-semibold">{req.nombreDocumento}</p>
                          {req.descripcionDetalle && (
                            <p className="mt-0.5 text-slate-300">
                              {req.descripcionDetalle}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}

                  <th className="py-2.5 pr-3 pl-2 text-right text-xs font-semibold text-slate-600">
                    Pagado
                  </th>
                </tr>
              </thead>
              <tbody>
                {inscritos.map((ins) => (
                  <FilaParticipanteAny
                    key={ins.id}
                    inscripcion={ins}
                    requisitos={requisitos}
                    documentos={documentosMap[ins.id] ?? []}
                    pagos={pagosMap[ins.id] ?? []} 
                    onVerFicha={setFichaAbierta}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Sheet: Ficha del participante ─────────────────────────── */}
      <FichaParticipanteSheet
        open={!!fichaAbierta}
        onClose={() => setFichaAbierta(null)}
        sesionId={sesionId}
        inscripcion={fichaAbierta}
        requisitos={requisitos}
        documentos={fichaAbierta ? (documentosMap[fichaAbierta.id] ?? []) : []}
        pagos={fichaAbierta ? (pagosMap[fichaAbierta.id] ?? []) : []}
      />

      {/* ── Sheet: Nueva inscripción ──────────────────────────────── */}
      <NuevaInscripcionSheet
        open={nuevaOpen}
        onClose={() => setNuevaOpen(false)}
        sesionId={sesionId}
      />
    </TooltipProvider>
  );
}
