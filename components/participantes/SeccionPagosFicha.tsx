"use client";

import { useState, useTransition } from "react";
import {
  Receipt,
  PlusCircle,
  Trash2,
  Loader2,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { registrarPago, eliminarPago } from "@/lib/actions/pagos.actions";
import type { Pago, TipoPago, MetodoPago } from "@/lib/types";

// ── Opciones ───────────────────────────────────────────────────────────────
const TIPOS_PAGO: { value: TipoPago; label: string }[] = [
  { value: "MATRICULA", label: "Matrícula" },
  { value: "CUOTA_INICIAL", label: "Cuota inicial" },
  { value: "CUOTA_MENSUAL", label: "Cuota mensual" },
  { value: "COLEGIATURA_TOTAL", label: "Colegiatura total" },
  { value: "CERTIFICADO", label: "Certificado" },
];

const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "DEPOSITO_BANCO", label: "Depósito bancario" },
];

const COLOR_TIPO: Record<TipoPago, string> = {
  MATRICULA: "bg-blue-50 text-blue-700",
  CUOTA_INICIAL: "bg-indigo-50 text-indigo-700",
  CUOTA_MENSUAL: "bg-slate-50 text-slate-600",
  COLEGIATURA_TOTAL: "bg-emerald-50 text-emerald-700",
  CERTIFICADO: "bg-amber-50 text-amber-700",
};

// ── Props ──────────────────────────────────────────────────────────────────
type Props = {
  inscripcionId: string;
  sesionId: string;
  pagos: Pago[];
};

const FORM_INICIAL = {
  nroBoleta: "",
  monto: "",
  tipo: "MATRICULA" as TipoPago,
  metodo: "EFECTIVO" as MetodoPago,
  observaciones: "",
};

export default function SeccionPagosFicha({
  inscripcionId,
  sesionId,
  pagos,
}: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [isPending, startTransition] = useTransition();
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

  const set =
    (campo: keyof typeof FORM_INICIAL) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleRegistrar = () => {
    if (!form.monto || parseFloat(form.monto) <= 0) {
      toast.error("El monto debe ser mayor a 0.");
      return;
    }
    startTransition(async () => {
      const result = await registrarPago({
        inscripcionId,
        sesionId,
        nroBoleta: form.nroBoleta || undefined,
        monto: parseFloat(form.monto),
        tipo: form.tipo,
        metodo: form.metodo,
        observaciones: form.observaciones || undefined,
      });
      if (result.success) {
        toast.success(result.mensaje);
        setForm(FORM_INICIAL);
        setMostrarForm(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEliminar = (pagoId: string) => {
    setEliminandoId(pagoId);
    startTransition(async () => {
      const result = await eliminarPago({ pagoId, sesionId });
      setEliminandoId(null);
      if (result.success) {
        toast.success(result.mensaje);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Historial de pagos
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-700">
            Total: Bs.{" "}
            <span className="text-emerald-700">
              {totalPagado.toLocaleString("es-BO")}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setMostrarForm((v) => !v)}
          disabled={isPending}
        >
          {mostrarForm ? (
            <>
              <ChevronUp className="size-3" />
              Cancelar
            </>
          ) : (
            <>
              <PlusCircle className="size-3" />
              Nuevo pago
            </>
          )}
        </Button>
      </div>

      {/* Formulario inline colapsable */}
      {mostrarForm && (
        <div className="rounded-md border border-blue-100 bg-blue-50/40 p-3 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-400">
            Registrar pago
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Nro. Boleta</Label>
              <Input
                value={form.nroBoleta}
                onChange={set("nroBoleta")}
                placeholder="BOL-001"
                className="h-7 text-xs"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">
                Monto (Bs.) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.monto}
                onChange={set("monto")}
                placeholder="500.00"
                className="h-7 text-xs"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, tipo: v as TipoPago }))
                }
                disabled={isPending}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PAGO.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      className="text-xs"
                    >
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Método</Label>
              <Select
                value={form.metodo}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, metodo: v as MetodoPago }))
                }
                disabled={isPending}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METODOS_PAGO.map((m) => (
                    <SelectItem
                      key={m.value}
                      value={m.value}
                      className="text-xs"
                    >
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            size="sm"
            className="h-7 w-full bg-blue-600 text-xs text-white hover:bg-blue-700"
            onClick={handleRegistrar}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-1.5 size-3 animate-spin" />
            ) : (
              <Receipt className="mr-1.5 size-3" />
            )}
            Registrar pago
          </Button>
        </div>
      )}

      {/* Lista de pagos */}
      {pagos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 py-6 text-slate-400">
          <CreditCard className="size-6 opacity-30" />
          <p className="text-xs">Sin pagos registrados.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {pagos.map((pago) => (
            <div
              key={pago.id}
              className="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-3 py-2"
            >
              <Receipt className="size-4 shrink-0 text-slate-300" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      COLOR_TIPO[pago.tipo],
                    )}
                  >
                    {TIPOS_PAGO.find((t) => t.value === pago.tipo)?.label ??
                      pago.tipo}
                  </span>
                  {pago.nroBoleta && (
                    <span className="text-[10px] text-slate-400">
                      #{pago.nroBoleta}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {new Date(pago.fechaPago).toLocaleString("es-BO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  · {METODOS_PAGO.find((m) => m.value === pago.metodo)?.label}
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                Bs. {Number(pago.monto).toLocaleString("es-BO")}
              </span>

              <button
                onClick={() => handleEliminar(pago.id)}
                disabled={isPending}
                title="Eliminar pago"
                className="shrink-0 rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
              >
                {eliminandoId === pago.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
