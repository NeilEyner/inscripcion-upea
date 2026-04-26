"use client";

import { cn } from "@/lib/utils";
import {
  LABEL_ESTADO_INSCRIPCION,
  COLOR_ESTADO_INSCRIPCION,
} from "@/lib/types";
import DocumentoPopover from "./DocumentoPopover";
import type {
  InscripcionDetalle,
  PlantillaRequisito,
  ControlDocumento,
  EstadoDocumento,
  Pago,
} from "@/lib/types";

type Props = {
  inscripcion: InscripcionDetalle;
  requisitos: PlantillaRequisito[];
  documentos: ControlDocumento[];
  pagos: Pago[];
  onVerFicha: (ins: InscripcionDetalle) => void;
};

export default function FilaParticipante({
  inscripcion,
  requisitos,
  documentos,
  pagos,
  onVerFicha,
}: Props) {
  const docIdx = Object.fromEntries(documentos.map((d) => [d.plantillaId, d]));
  const colors = COLOR_ESTADO_INSCRIPCION[inscripcion.estadoInscripcion];
  const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
  return (
    <tr
      className="group border-b border-slate-100 transition-colors hover:bg-slate-50/70 cursor-pointer"
      onClick={() => onVerFicha(inscripcion)}
    >
      {/* Participante */}
      <td className="sticky left-0 z-10 bg-white py-2.5 pl-3 pr-4 group-hover:bg-slate-50/70">
        <p className="text-xs font-semibold text-slate-800 leading-tight">
          {inscripcion.nombreCompleto}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{inscripcion.ci}</p>
      </td>

      {/* Estado */}
      <td className="px-2 py-2.5">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            colors.bg,
            colors.text,
            colors.border,
          )}
        >
          {LABEL_ESTADO_INSCRIPCION[inscripcion.estadoInscripcion]}
        </span>
      </td>

      {/* Progreso documentos */}
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-xs font-semibold tabular-nums",
              inscripcion.docsPendientes > 0
                ? "text-rose-600"
                : "text-emerald-600",
            )}
          >
            {inscripcion.docsEntregados}/{inscripcion.totalDocs}
          </span>
          {inscripcion.docsObservados > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
              {inscripcion.docsObservados} obs.
            </span>
          )}
        </div>
      </td>

      {/* Badge por cada documento */}
      {requisitos.map((req) => {
        const doc = docIdx[req.id];
        const estado: EstadoDocumento = doc?.estado ?? "pendiente";
        return (
          <td
            key={req.id}
            className="px-1.5 py-2.5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <DocumentoPopover
              inscripcionId={inscripcion.id}
              plantillaId={req.id}
              nombreDocumento={req.nombreDocumento}
              estadoActual={estado}
              fechaEntrega={doc?.fechaEntrega ?? null}
              observacionesActuales={doc?.observaciones ?? null}
            />
          </td>
        );
      })}

      {/* Total pagado */}
      <td className="py-2.5 pr-3 pl-2 text-right">
        <span className="text-xs font-semibold tabular-nums text-slate-700">
          Bs.{" "}
          {totalPagado.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
        </span>
      </td>
    </tr>
  );
}
