"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { crearInscripcion } from "@/lib/actions/inscripciones.actions";
import type { EstadoInscripcion } from "@/lib/types";

// ── Props ─────────────────────────────────────────────────────────────────
type Props = {
  open: boolean;
  onClose: () => void;
  sesionId: string;
};

// ── Estado inicial del formulario ─────────────────────────────────────────
const FORM_INICIAL = {
  ci: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  correo: "",
  celular: "",
  estadoInscripcion: "preinscrito" as EstadoInscripcion,
  tipoDescuento: "",
  descuentoPorcentaje: "",
  observacionesGenerales: "",
};

// ── Opciones de estado ────────────────────────────────────────────────────
const ESTADOS: { value: EstadoInscripcion; label: string }[] = [
  { value: "preinscrito", label: "Preinscrito" },
  { value: "confirmado", label: "Confirmado" },
  { value: "cancelado", label: "Cancelado" },
];

export default function NuevaInscripcionSheet({ open, onClose, sesionId }: Props) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState<Partial<typeof FORM_INICIAL>>({});
  const [isPending, startTransition] = useTransition();

  const set = (campo: keyof typeof FORM_INICIAL) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  // ── Validación básica ─────────────────────────────────────────────────
  const validar = (): boolean => {
    const e: Partial<typeof FORM_INICIAL> = {};
    if (!form.ci.trim()) e.ci = "El CI es obligatorio.";
    if (!form.nombres.trim()) e.nombres = "El nombre es obligatorio.";
    if (!form.apellidoPaterno.trim()) e.apellidoPaterno = "El apellido paterno es obligatorio.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validar()) return;

    startTransition(async () => {
      const result = await crearInscripcion({
        sesionId,
        ci: form.ci,
        nombres: form.nombres,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno || undefined,
        correo: form.correo || undefined,
        celular: form.celular || undefined,
        estadoInscripcion: form.estadoInscripcion,
        tipoDescuento: form.tipoDescuento || undefined,
        descuentoPorcentaje: form.descuentoPorcentaje
          ? parseInt(form.descuentoPorcentaje)
          : 0,
        observacionesGenerales: form.observacionesGenerales || undefined,
      });

      if (result.success) {
        toast.success("Inscripción creada", { description: result.mensaje });
        setForm(FORM_INICIAL);
        setErrores({});
        onClose();
      } else {
        toast.error("Error al inscribir", { description: result.error });
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setForm(FORM_INICIAL);
      setErrores({});
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* ── Encabezado ─────────────────────────────────────────────── */}
        <SheetHeader className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
              <UserPlus className="size-4 text-blue-600" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold text-slate-800">
                Nueva Inscripción
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-400">
                El participante se crea o actualiza por CI.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Cuerpo con scroll ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Sección: Datos personales */}
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Datos del participante
          </p>

          <div className="grid gap-3">
            {/* CI */}
            <div className="space-y-1">
              <Label htmlFor="ci" className="text-xs font-medium text-slate-600">
                CI <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="ci"
                value={form.ci}
                onChange={set("ci")}
                placeholder="12345678"
                className="h-8 text-sm uppercase"
                disabled={isPending}
              />
              {errores.ci && (
                <p className="flex items-center gap-1 text-[10px] text-rose-500">
                  <AlertCircle className="size-3" />
                  {errores.ci}
                </p>
              )}
            </div>

            {/* Nombres */}
            <div className="space-y-1">
              <Label htmlFor="nombres" className="text-xs font-medium text-slate-600">
                Nombres <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="nombres"
                value={form.nombres}
                onChange={set("nombres")}
                placeholder="Juan Carlos"
                className="h-8 text-sm"
                disabled={isPending}
              />
              {errores.nombres && (
                <p className="flex items-center gap-1 text-[10px] text-rose-500">
                  <AlertCircle className="size-3" />
                  {errores.nombres}
                </p>
              )}
            </div>

            {/* Apellido Paterno / Materno en fila */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="ap" className="text-xs font-medium text-slate-600">
                  Ap. Paterno <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="ap"
                  value={form.apellidoPaterno}
                  onChange={set("apellidoPaterno")}
                  placeholder="García"
                  className="h-8 text-sm"
                  disabled={isPending}
                />
                {errores.apellidoPaterno && (
                  <p className="flex items-center gap-1 text-[10px] text-rose-500">
                    <AlertCircle className="size-3" />
                    {errores.apellidoPaterno}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="am" className="text-xs font-medium text-slate-600">
                  Ap. Materno
                </Label>
                <Input
                  id="am"
                  value={form.apellidoMaterno}
                  onChange={set("apellidoMaterno")}
                  placeholder="López"
                  className="h-8 text-sm"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Correo / Celular en fila */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="correo" className="text-xs font-medium text-slate-600">
                  Correo
                </Label>
                <Input
                  id="correo"
                  type="email"
                  value={form.correo}
                  onChange={set("correo")}
                  placeholder="correo@mail.com"
                  className="h-8 text-sm"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="celular" className="text-xs font-medium text-slate-600">
                  Celular
                </Label>
                <Input
                  id="celular"
                  value={form.celular}
                  onChange={set("celular")}
                  placeholder="70012345"
                  className="h-8 text-sm"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Sección: Datos de inscripción */}
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Datos de inscripción
          </p>

          <div className="grid gap-3">
            {/* Estado */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">
                Estado inicial
              </Label>
              <Select
                value={form.estadoInscripcion}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, estadoInscripcion: v as EstadoInscripcion }))
                }
                disabled={isPending}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value} className="text-sm">
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descuento en fila */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="tipoDescuento" className="text-xs font-medium text-slate-600">
                  Tipo descuento
                </Label>
                <Input
                  id="tipoDescuento"
                  value={form.tipoDescuento}
                  onChange={set("tipoDescuento")}
                  placeholder="Docente UPEA"
                  className="h-8 text-sm"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="descuento" className="text-xs font-medium text-slate-600">
                  % Descuento
                </Label>
                <Input
                  id="descuento"
                  type="number"
                  min={0}
                  max={100}
                  value={form.descuentoPorcentaje}
                  onChange={set("descuentoPorcentaje")}
                  placeholder="0"
                  className="h-8 text-sm"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-1">
              <Label htmlFor="obs" className="text-xs font-medium text-slate-600">
                Observaciones
              </Label>
              <Textarea
                id="obs"
                value={form.observacionesGenerales}
                onChange={set("observacionesGenerales")}
                placeholder="Notas internas sobre la inscripción…"
                className="min-h-17.5 resize-none text-sm"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <SheetFooter className="border-t border-slate-100 px-6 py-4">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="h-9 flex-1 text-sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              className="h-9 flex-1 bg-blue-600 text-sm text-white hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-3.5" />
                  Inscribir
                  <ChevronRight className="ml-1 size-3.5" />
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}