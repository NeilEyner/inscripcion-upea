"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  FileText,
  CreditCard,
  Pencil,
  Save,
  X,
  Loader2,
  BadgeCheck,
  Clock,
  Ban,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  actualizarInscripcion,
  actualizarParticipante,
} from "@/lib/actions/inscripciones.actions";
import SeccionDocumentosFicha from "./SeccionDocumentosFicha";
import SeccionPagosFicha from "./SeccionPagosFicha";
import type {
  InscripcionDetalle,
  ControlDocumento,
  PlantillaRequisito,
  Pago,
  EstadoInscripcion,
} from "@/lib/types";
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";

// ── Icono y color por estado de inscripción ───────────────────────────────
const ESTADO_CONFIG: Record<
  EstadoInscripcion,
  { icon: React.ElementType; clase: string; label: string }
> = {
  confirmado: {
    icon: BadgeCheck,
    clase: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Confirmado",
  },
  preinscrito: {
    icon: Clock,
    clase: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Preinscrito",
  },
  cancelado: {
    icon: Ban,
    clase: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Cancelado",
  },
  transferido: {
    icon: ArrowLeftRight,
    clase: "bg-purple-50 text-purple-700 border-purple-200",
    label: "Transferido",
  },
};

const ESTADOS_OPCIONES: { value: EstadoInscripcion; label: string }[] = [
  { value: "preinscrito", label: "Preinscrito" },
  { value: "confirmado", label: "Confirmado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "transferido", label: "Transferido" },
];

// ── Props ─────────────────────────────────────────────────────────────────
type Props = {
  open: boolean;
  onClose: () => void;
  sesionId: string;
  inscripcion: InscripcionDetalle | null;
  requisitos: PlantillaRequisito[];
  documentos: ControlDocumento[];
  pagos: Pago[];
};

export default function FichaParticipanteSheet({
  open,
  onClose,
  sesionId,
  inscripcion,
  requisitos,
  documentos,
  pagos,
}: Props) {
  const [editandoPersonal, setEditandoPersonal] = useState(false);
  const [editandoInscripcion, setEditandoInscripcion] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Formulario datos personales ────────────────────────────────────────
  const [formPersonal, setFormPersonal] = useState({
    nombres: inscripcion?.nombres ?? "",
    apellidoPaterno: inscripcion?.apellidoPaterno ?? "",
    apellidoMaterno: inscripcion?.apellidoMaterno ?? "",
    correo: inscripcion?.correo ?? "",
    celular: inscripcion?.celular ?? "",
  });

  // ── Formulario datos inscripción ───────────────────────────────────────
  const [formIns, setFormIns] = useState({
    estadoInscripcion: (inscripcion?.estadoInscripcion ??
      "preinscrito") as EstadoInscripcion,
    tipoDescuento: inscripcion?.tipoDescuento ?? "",
    descuentoPorcentaje: String(inscripcion?.descuentoPorcentaje ?? 0),
    observacionesGenerales: inscripcion?.observacionesGenerales ?? "",
  });

  // Sincronizar formularios cuando cambia la inscripción seleccionada
  const sincronizar = () => {
    if (!inscripcion) return;
    setFormPersonal({
      nombres: inscripcion.nombres,
      apellidoPaterno: inscripcion.apellidoPaterno,
      apellidoMaterno: inscripcion.apellidoMaterno ?? "",
      correo: inscripcion.correo ?? "",
      celular: inscripcion.celular ?? "",
    });
    setFormIns({
      estadoInscripcion: inscripcion.estadoInscripcion as EstadoInscripcion,
      tipoDescuento: inscripcion.tipoDescuento ?? "",
      descuentoPorcentaje: String(inscripcion.descuentoPorcentaje ?? 0),
      observacionesGenerales: inscripcion.observacionesGenerales ?? "",
    });
  };

  const setP =
    (campo: keyof typeof formPersonal) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormPersonal((p) => ({ ...p, [campo]: e.target.value }));

  const setI =
    (campo: keyof typeof formIns) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormIns((p) => ({ ...p, [campo]: e.target.value }));
  useEffect(() => {
    if (inscripcion) sincronizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inscripcion?.id]);
  // ── Guardar datos personales ───────────────────────────────────────────
  const guardarPersonal = () => {
    if (!inscripcion) return;
    startTransition(async () => {
      const result = await actualizarParticipante({
        participanteId: inscripcion.participanteId,
        sesionId,
        ...formPersonal,
        apellidoMaterno: formPersonal.apellidoMaterno || undefined,
        correo: formPersonal.correo || undefined,
        celular: formPersonal.celular || undefined,
      });
      if (result.success) {
        toast.success("Datos actualizados correctamente.");
        setEditandoPersonal(false); // o setEditandoInscripcion(false)
      } else {
        toast.error(result.error);
      }
    });
  };

  // ── Guardar datos de inscripción ───────────────────────────────────────
  const guardarInscripcion = () => {
    if (!inscripcion) return;
    startTransition(async () => {
      const result = await actualizarInscripcion({
        inscripcionId: inscripcion.id,
        sesionId,
        estadoInscripcion: formIns.estadoInscripcion,
        tipoDescuento: formIns.tipoDescuento || undefined,
        descuentoPorcentaje: parseInt(formIns.descuentoPorcentaje) || 0,
        observacionesGenerales: formIns.observacionesGenerales || undefined,
      });
      if (result.success) {
        toast.success(result.mensaje);
        setEditandoInscripcion(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  // Estadísticas rápidas de documentos
  const handleClose = () => {
    if (!isPending) {
      setEditandoPersonal(false);
      setEditandoInscripcion(false);
      onClose();
    }
  };

  // ── Guard: nada de esto puede ejecutarse si inscripcion es null ───────────
  // Los cálculos que usan `inscripcion` van DESPUÉS de este return.
  if (!inscripcion) return null;

  // ── Estadísticas rápidas (seguras: inscripcion ya está garantizado) ───────
  const docIdx = Object.fromEntries(documentos.map((d) => [d.plantillaId, d]));

  const docsEntregados = documentos.filter(
    (d) => d.estado === "entregado",
  ).length;
  const docsPendientes = documentos.filter(
    (d) => d.estado === "pendiente",
  ).length;
  const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

  // Nombres detallados para el mensaje de WhatsApp
  const pendientesNombres = requisitos
    .filter((r) => {
      const d = docIdx[r.id];
      return !d || d.estado === "pendiente";
    })
    .map((r) => `• ${r.nombreDocumento}`);

  const observadosNombres = requisitos
    .filter((r) => docIdx[r.id]?.estado === "observado")
    .map((r) => `• ${r.nombreDocumento} _(observado)_`);

  const totalDocsPendientes =
    pendientesNombres.length + observadosNombres.length;

  // Mensaje personalizado con la lista exacta de documentos
  const mensajeWA = encodeURIComponent(
    `Estimado/a *${inscripcion.nombres} ${inscripcion.apellidoPaterno}*,\n\n` +
      `Le comunicamos que tiene documentos pendientes para su inscripción en el programa *${inscripcion.nombreCompleto ? "" : ""}*.\n\n` +
      (pendientesNombres.length > 0
        ? `📋 *Documentos pendientes:*\n${pendientesNombres.join("\n")}\n\n`
        : "") +
      (observadosNombres.length > 0
        ? `⚠️ *Documentos observados:*\n${observadosNombres.join("\n")}\n\n`
        : "") +
      `Por favor acérquese a regularizar su situación a la brevedad posible.\n\nGracias.`,
  );

  const estadoConf =
    ESTADO_CONFIG[inscripcion.estadoInscripcion as EstadoInscripcion];
  const EstadoIcon = estadoConf.icon;

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else sincronizar();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        {/* ── Encabezado ─────────────────────────────────────────────── */}
        <SheetHeader className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-start gap-3">
            {/* Avatar inicial */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
              {inscripcion.nombres.charAt(0)}
              {inscripcion.apellidoPaterno.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-sm font-semibold text-slate-800">
                {inscripcion.nombreCompleto}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-xs text-slate-400">
                CI: {inscripcion.ci}
              </SheetDescription>
              {/* Badge de estado */}
              <span
                className={cn(
                  "mt-1.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                  estadoConf.clase,
                )}
              >
                <EstadoIcon className="size-3" />
                {estadoConf.label}
              </span>
              {totalDocsPendientes > 0 && inscripcion.celular && (
                <a
                  href={`https://wa.me/${inscripcion.celular.replace(/\D/g, "")}?text=${mensajeWA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[10px] font-semibold text-green-700 transition-colors hover:bg-green-100"
                >
                  <MessageCircle className="size-3" />
                  WhatsApp · {totalDocsPendientes} doc
                  {totalDocsPendientes !== 1 ? "s" : ""} pendiente
                  {totalDocsPendientes !== 1 ? "s" : ""}
                </a>
              )}
            </div>
          </div>

          {/* KPIs rápidos */}
          <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 rounded-md border border-slate-100 bg-slate-50">
            <div className="px-3 py-2 text-center">
              <p className="text-xs font-bold text-emerald-600">
                {docsEntregados}
              </p>
              <p className="text-[10px] text-slate-400">Docs entregados</p>
            </div>
            <div className="px-3 py-2 text-center">
              <p className="text-xs font-bold text-rose-500">
                {docsPendientes}
              </p>
              <p className="text-[10px] text-slate-400">Pendientes</p>
            </div>
            <div className="px-3 py-2 text-center">
              <p className="text-xs font-bold text-slate-700">
                Bs. {totalPagado.toLocaleString("es-BO")}
              </p>
              <p className="text-[10px] text-slate-400">Total pagado</p>
            </div>
          </div>
        </SheetHeader>

        {/* ── Tabs principales ───────────────────────────────────────── */}
        <Tabs
          defaultValue="documentos"
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="h-9 w-full rounded-none border-b border-slate-100 bg-white px-6">
            <TabsTrigger
              value="documentos"
              className="gap-1.5 text-xs data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              <FileText className="size-3.5" />
              Documentos
            </TabsTrigger>
            <TabsTrigger
              value="pagos"
              className="gap-1.5 text-xs data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              <CreditCard className="size-3.5" />
              Pagos
            </TabsTrigger>
            <TabsTrigger
              value="perfil"
              className="gap-1.5 text-xs data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              <User className="size-3.5" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: Documentos ─────────────────────────────────────── */}
          <TabsContent
            value="documentos"
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <SeccionDocumentosFicha
              inscripcionId={inscripcion.id}
              requisitos={requisitos}
              documentos={documentos}
            />
          </TabsContent>

          {/* ── TAB: Pagos ──────────────────────────────────────────── */}
          <TabsContent
            value="pagos"
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <SeccionPagosFicha
              inscripcionId={inscripcion.id}
              sesionId={sesionId}
              pagos={pagos}
            />
          </TabsContent>

          {/* ── TAB: Perfil ─────────────────────────────────────────── */}
          <TabsContent
            value="perfil"
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
          >
            {/* --- Datos personales --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Datos personales
                </p>
                {!editandoPersonal ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-xs text-slate-500"
                    onClick={() => setEditandoPersonal(true)}
                  >
                    <Pencil className="size-3" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-xs text-slate-400"
                      onClick={() => {
                        sincronizar();
                        setEditandoPersonal(false);
                      }}
                      disabled={isPending}
                    >
                      <X className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 gap-1 bg-blue-600 text-xs text-white hover:bg-blue-700"
                      onClick={guardarPersonal}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Save className="size-3" />
                      )}
                      Guardar
                    </Button>
                  </div>
                )}
              </div>

              {editandoPersonal ? (
                <div className="grid gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">Nombres</Label>
                      <Input
                        value={formPersonal.nombres}
                        onChange={setP("nombres")}
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">
                        Ap. Paterno
                      </Label>
                      <Input
                        value={formPersonal.apellidoPaterno}
                        onChange={setP("apellidoPaterno")}
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">
                        Ap. Materno
                      </Label>
                      <Input
                        value={formPersonal.apellidoMaterno}
                        onChange={setP("apellidoMaterno")}
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">Celular</Label>
                      <Input
                        value={formPersonal.celular}
                        onChange={setP("celular")}
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Correo</Label>
                    <Input
                      type="email"
                      value={formPersonal.correo}
                      onChange={setP("correo")}
                      className="h-7 text-xs"
                      disabled={isPending}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-1.5">
                  {[
                    { label: "CI", value: inscripcion.ci },
                    {
                      label: "Nombre completo",
                      value: inscripcion.nombreCompleto,
                    },
                    { label: "Correo", value: inscripcion.correo ?? "—" },
                    { label: "Celular", value: inscripcion.celular ?? "—" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-[11px] text-slate-400">
                        {label}
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* --- Datos de inscripción --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Datos de inscripción
                </p>
                {!editandoInscripcion ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-xs text-slate-500"
                    onClick={() => setEditandoInscripcion(true)}
                  >
                    <Pencil className="size-3" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-xs text-slate-400"
                      onClick={() => {
                        sincronizar();
                        setEditandoInscripcion(false);
                      }}
                      disabled={isPending}
                    >
                      <X className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 gap-1 bg-blue-600 text-xs text-white hover:bg-blue-700"
                      onClick={guardarInscripcion}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Save className="size-3" />
                      )}
                      Guardar
                    </Button>
                  </div>
                )}
              </div>

              {editandoInscripcion ? (
                <div className="grid gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Estado</Label>
                    <Select
                      value={formIns.estadoInscripcion}
                      onValueChange={(v) =>
                        setFormIns((p) => ({
                          ...p,
                          estadoInscripcion: v as EstadoInscripcion,
                        }))
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_OPCIONES.map((e) => (
                          <SelectItem
                            key={e.value}
                            value={e.value}
                            className="text-xs"
                          >
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">
                        Tipo descuento
                      </Label>
                      <Input
                        value={formIns.tipoDescuento}
                        onChange={setI("tipoDescuento")}
                        placeholder="Docente UPEA"
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">
                        % Descuento
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={formIns.descuentoPorcentaje}
                        onChange={setI("descuentoPorcentaje")}
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">
                      Observaciones
                    </Label>
                    <Textarea
                      value={formIns.observacionesGenerales}
                      onChange={setI("observacionesGenerales")}
                      className="min-h-15 resize-none text-xs"
                      disabled={isPending}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-1.5">
                  {[
                    {
                      label: "Fecha inscripción",
                      value: new Date(
                        inscripcion.fechaInscripcion,
                      ).toLocaleDateString("es-BO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }),
                    },
                    {
                      label: "Tipo descuento",
                      value: inscripcion.tipoDescuento ?? "—",
                    },
                    {
                      label: "% Descuento",
                      value: `${inscripcion.descuentoPorcentaje ?? 0}%`,
                    },
                    {
                      label: "Observaciones",
                      value: inscripcion.observacionesGenerales ?? "—",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between py-1"
                    >
                      <span className="text-[11px] text-slate-400">
                        {label}
                      </span>
                      <span className="max-w-50 text-right text-xs font-medium text-slate-700">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
