"use client";

import { useState } from "react";
import { FileDown, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type {
  InscripcionDetalle,
  ControlDocumento,
  PlantillaRequisito,
  EstadoInscripcion,
  Pago,
} from "@/lib/types";

// ── Props ─────────────────────────────────────────────────────────────────
type Props = {
  sesionNombre: string;
  inscripciones: InscripcionDetalle[];
  documentosMap: Record<string, ControlDocumento[]>;
  requisitos: PlantillaRequisito[];
  pagosMap: Record<string, Pago[]>;
};

const ESTADOS_OPCIONES: {
  value: EstadoInscripcion;
  label: string;
}[] = [
  { value: "confirmado", label: "Confirmados" },
  { value: "preinscrito", label: "Preinscritos" },
  { value: "transferido", label: "Transferidos" },
  { value: "cancelado", label: "Cancelados" },
];

// ── Componente ────────────────────────────────────────────────────────────
export default function ExportPdfButton({
  sesionNombre,
  inscripciones,
  documentosMap,
  requisitos,
  pagosMap,
}: Props) {
  const [open, setOpen] = useState(false);
  const [entregador, setEntregador] = useState("");
  const [receptor, setReceptor] = useState("");
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<
    EstadoInscripcion[]
  >(["confirmado", "preinscrito"]);
  const [isPrinting, setIsPrinting] = useState(false);

  const toggleEstado = (estado: EstadoInscripcion) =>
    setEstadosSeleccionados((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado]
    );

  const handleExport = () => {
    setIsPrinting(true);

    const filtradas = inscripciones.filter((ins) =>
      estadosSeleccionados.includes(ins.estadoInscripcion)
    );

    const html = buildPdfHtml({
      sesionNombre,
      inscripciones: filtradas,
      documentosMap,
      requisitos,
      pagosMap,
      entregador,
      receptor,
    });

    const win = window.open("", "_blank", "width=1200,height=800");
    if (win) {
      win.document.write(html);
      win.document.close();
      // Esperar a que carguen los estilos antes de imprimir
      win.addEventListener("load", () => {
        setTimeout(() => {
          win.print();
          setIsPrinting(false);
        }, 400);
      });
    } else {
      setIsPrinting(false);
    }

    setOpen(false);
  };

  return (
    <>
      {/* Botón principal — sin ningún wrapper que genere <button> anidado */}
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 text-xs border-slate-200"
        onClick={() => setOpen(true)}
      >
        <FileDown className="size-3.5" />
        Exportar PDF
      </Button>

      {/* Dialog de configuración */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-slate-800">
              Exportar lista de participantes
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configura los datos del documento antes de imprimir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Estados a incluir */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Estados a incluir
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ESTADOS_OPCIONES.map(({ value, label }) => (
                  <div key={value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`chk-${value}`}
                      checked={estadosSeleccionados.includes(value)}
                      onChange={() => toggleEstado(value)}
                    />
                    <label
                      htmlFor={`chk-${value}`}
                      className="cursor-pointer text-xs text-slate-600"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Entregador */}
            <div className="space-y-1">
              <Label htmlFor="entregador" className="text-xs text-slate-600">
                Nombre del entregador
              </Label>
              <Input
                id="entregador"
                value={entregador}
                onChange={(e) => setEntregador(e.target.value)}
                placeholder="Ej: Lic. Juan García"
                className="h-8 text-sm"
              />
            </div>

            {/* Receptor */}
            <div className="space-y-1">
              <Label htmlFor="receptor" className="text-xs text-slate-600">
                Nombre del receptor / área
              </Label>
              <Input
                id="receptor"
                value={receptor}
                onChange={(e) => setReceptor(e.target.value)}
                placeholder="Ej: Dirección Académica"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPrinting}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleExport}
              disabled={estadosSeleccionados.length === 0 || isPrinting}
            >
              {isPrinting ? (
                <Loader2 className="mr-2 size-3.5 animate-spin" />
              ) : (
                <Printer className="mr-2 size-3.5" />
              )}
              Imprimir / Guardar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Generador HTML para impresión ─────────────────────────────────────────
function buildPdfHtml(params: {
  sesionNombre: string;
  inscripciones: InscripcionDetalle[];
  documentosMap: Record<string, ControlDocumento[]>;
  requisitos: PlantillaRequisito[];
  pagosMap: Record<string, Pago[]>;
  entregador: string;
  receptor: string;
}): string {
  const {
    sesionNombre,
    inscripciones,
    documentosMap,
    requisitos,
    pagosMap,
    entregador,
    receptor,
  } = params;

  const fecha = new Date().toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const LABEL_ESTADO: Record<EstadoInscripcion, string> = {
    confirmado: "Confirmado",
    preinscrito: "Preinscrito",
    transferido: "Transferido",
    cancelado: "Cancelado",
  };

  // Encabezados de documentos (rotados)
  const docHeaders = requisitos
    .map(
      (r) => `<th class="doc-header">
        <div class="doc-header-text" title="${r.nombreDocumento}">${r.nombreDocumento}</div>
      </th>`
    )
    .join("");

  // Filas de participantes
  const rows = inscripciones
    .map((ins, idx) => {
      const docs = documentosMap[ins.id] ?? [];
      const docIdx = Object.fromEntries(docs.map((d) => [d.plantillaId, d]));

      const docCells = requisitos
        .map((req) => {
          const doc = docIdx[req.id];
          const estado = doc?.estado ?? "pendiente";
          if (estado === "entregado" || estado === "exento") {
            return `<td class="doc-cell cell-ok">✓</td>`;
          } else if (estado === "observado") {
            return `<td class="doc-cell cell-obs" title="${doc?.observaciones ?? ""}">!</td>`;
          } else {
            return `<td class="doc-cell cell-no">✗</td>`;
          }
        })
        .join("");

      // Total pagado desde pagosMap (siempre fresco)
      const pagos = pagosMap[ins.id] ?? [];
      const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

      // Desglose de pagos en tooltip
      const desglose = pagos
        .map(
          (p) =>
            `${p.tipo.replace("_", " ")}: Bs.${Number(p.monto).toLocaleString("es-BO")}`
        )
        .join(" | ");

      const estadoClass = `estado-${ins.estadoInscripcion}`;

      return `
        <tr class="${idx % 2 === 0 ? "row-even" : "row-odd"}">
          <td class="td-center td-num">${idx + 1}</td>
          <td class="td-nombre">${ins.nombreCompleto}</td>
          <td class="td-center">${ins.ci}</td>
          <td class="td-center">${ ins.celular || "-"}</td> ${docCells}
          <td class="td-right td-pagado" title="${desglose}">
            Bs. ${totalPagado.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
            ${pagos.length > 1 ? `<span class="pagos-count">(${pagos.length} cuotas)</span>` : ""}
          </td>
        </tr>`;
    })
    .join("");

  // Resumen por estado
  const resumen = ESTADOS_OPCIONES.map(({ value, label }) => {
    const count = inscripciones.filter((i) => i.estadoInscripcion === value).length;
    return count > 0
      ? `<span class="resumen-item"><strong>${count}</strong> ${label}</span>`
      : "";
  })
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  const totalGeneral = inscripciones.reduce((acc, ins) => {
    const pagos = pagosMap[ins.id] ?? [];
    return acc + pagos.reduce((a, p) => a + Number(p.monto), 0);
  }, 0);

return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Control Documental — ${sesionNombre}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @page { 
      size: letter landscape; 
      margin: 7mm 8mm; 
    }

    body {
      font-family: "Helvetica", "Arial", sans-serif;
      font-size: 6px; /* Reducción general de un punto */
      color: #1e293b;
      background: white;
      line-height: 1.2;
    }

    /* ── Encabezado ── */
    .header {
      border-bottom: 1px solid #000;
      padding-bottom: 3px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title h1 { 
      font-size: 10px; 
      font-weight: 700; 
      text-transform: uppercase; 
      color: #000; 
    }
    .header-title h2 { font-size: 6.5px; color: #475569; font-weight: normal; }

    /* ── Tabla Técnica ── */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      table-layout: fixed; 
    }

    /* Bloqueo estricto de columnas de pago y estado anterior */
    .td-pagado, .th-pagado, .td-estado, .th-estado, [class*="pago"], [class*="monto"] {
      display: none !important;
    }

    thead th {
      background: #f1f5f9;
      border: 0.4px solid #000;
      padding: 2px 1px;
      font-weight: bold;
      font-size: 5.5px;
      text-transform: uppercase;
      text-align: center;
    }

    .th-num    { width: 18px; }
    .th-nombre { width: 190px; text-align: left !important; padding-left: 4px; }
    .th-ci     { width: 50px; }
    .th-tel    { width: 50px; } /* Nueva columna de número */

    /* Nombres de documentos: Ultra pequeños */
    .th-req {
      width: 38px;
      font-size: 5px; 
      line-height: 0.9;
      word-wrap: break-word;
      white-space: normal;
    }

    tbody td {
      border: 0.4px solid #000;
      padding: 1.5px;
      height: 18px;
      vertical-align: middle;
    }

    .td-nombre { font-size: 7px; font-weight: 600; color: #000; }
    .td-center { text-align: center; }

    /* ── Alineación de Símbolos ── */
    .doc-cell {
      text-align: center !important; 
      vertical-align: middle !important; 
      font-size: 9px;
      font-weight: bold;
    }
    
    .cell-ok  { color: #15803d; } 
    .cell-no  { color: #b91c1c; } 
    .cell-obs { color: #b45309; }

    /* ── Firmas ── */
    .firmas {
      margin-top: 25px;
      display: flex;
      justify-content: space-around;
      page-break-inside: avoid;
    }
    .firma-box { 
      text-align: center; 
      width: 200px;
    }
    .firma-line { border-top: 0.7px solid #000; margin-bottom: 2px; }
    .firma-nombre { font-size: 6.5px; font-weight: bold; text-transform: uppercase; }
    .firma-label { font-size: 5.5px; color: #64748b; text-transform: uppercase; }

    .leyenda {
      margin-top: 10px;
      font-size: 5.5px;
      color: #475569;
      display: flex;
      gap: 12px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-title">
      <h1>Planilla de Control y Recepción Documental</h1>
      <h2>Sesión: ${sesionNombre}</h2>
    </div>
    <div style="text-align: right; font-size: 6px;">
      FECHA: ${fecha} | TOTAL REGISTROS: ${inscripciones.length}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="th-num">N°</th>
        <th class="th-nombre">Apellidos y Nombres</th>
        <th class="th-ci">C.I.</th>
        <th class="th-tel">N° Celular</th>
        ${docHeaders}
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="leyenda">
    <span><strong>REFERENCIAS:</strong></span>
    <span><b class="cell-ok">✓</b> ENTREGADO</span>
    <span><b class="cell-no">✗</b> PENDIENTE</span>
    <span><b class="cell-obs">!</b> OBSERVADO</span>
  </div>

  <div class="firmas">
    <div class="firma-box">
      <div style="height: 30px;"></div>
      <div class="firma-line"></div>
      <div class="firma-nombre">${entregador || "___________________________"}</div>
      <div class="firma-label">Responsable de Entrega</div>
    </div>
    <div class="firma-box">
      <div style="height: 30px;"></div>
      <div class="firma-line"></div>
      <div class="firma-nombre">${receptor || "___________________________"}</div>
      <div class="firma-label">Responsable de Recepción</div>
    </div>
  </div>

</body>
</html>`;
}

