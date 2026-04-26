"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { crearSesion } from "@/lib/actions/sesiones.actions";
import { CATEGORIAS, LABEL_CATEGORIA } from "@/lib/types";
import type { CategoriaPrograma } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Loader2,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const AÑO_ACTUAL = new Date().getFullYear();

const MODALIDADES = ["VIRTUAL", "PRESENCIAL", "SEMIPRESENCIAL"];
const SEDES = ["EL ALTO", "LA PAZ", "OTRA"];

interface FormState {
  categoria: CategoriaPrograma;
  nombre: string;
  version: string;
  gestion: string;
  sede: string;
  modalidad: string;
  cupoMinimo: string;
  cupoMaximo: string;
  responsableRegistro: string;
  password: string;
  passwordConfirm: string;
}

const ESTADO_INICIAL: FormState = {
  categoria: "DIPLOMADO",
  nombre: "",
  version: "SIN VERSION",
  gestion: String(AÑO_ACTUAL),
  sede: "EL ALTO",
  modalidad: "VIRTUAL",
  cupoMinimo: "20",
  cupoMaximo: "50",
  responsableRegistro: "",
  password: "",
  passwordConfirm: "",
};

export function NuevaSesionDialog() {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [mostrarPwd, setMostrarPwd] = useState(false);
  const [errores, setErrores] = useState<Partial<FormState>>({});
  const [isPending, startTransition] = useTransition();

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrores((prev) => ({ ...prev, [key]: undefined }));
  }

  function validar(): boolean {
    const e: Partial<FormState> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.responsableRegistro.trim())
      e.responsableRegistro = "El responsable es obligatorio.";
    if (form.password.length < 4)
      e.password = "La clave debe tener al menos 4 caracteres.";
    if (form.password !== form.passwordConfirm)
      e.passwordConfirm = "Las claves no coinciden.";
    const min = parseInt(form.cupoMinimo);
    const max = parseInt(form.cupoMaximo);
    if (isNaN(min) || min < 1) e.cupoMinimo = "Mínimo debe ser mayor a 0.";
    if (isNaN(max) || max < min)
      e.cupoMaximo = "El máximo debe ser mayor al mínimo.";
    if (max > 100) e.cupoMaximo = "El máximo no puede superar 100.";
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    startTransition(async () => {
      const result = await crearSesion({
        categoria: form.categoria,
        nombre: form.nombre.trim(),
        version: form.version.trim() || "SIN VERSION",
        gestion: parseInt(form.gestion),
        sede: form.sede,
        modalidad: form.modalidad,
        cupoMinimo: parseInt(form.cupoMinimo),
        cupoMaximo: parseInt(form.cupoMaximo),
        responsableRegistro: form.responsableRegistro.trim(),
        password: form.password,
      });

      if (result.ok) {
        toast.success("Programa creado correctamente.", {
          description: form.nombre,
        });
        setAbierto(false);
        setForm(ESTADO_INICIAL);
        setErrores({});
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        if (!isPending) {
          setAbierto(v);
          if (!v) {
            setForm(ESTADO_INICIAL);
            setErrores({});
          }
        }
      }}
    >
      <DialogTrigger 
  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition-colors bg-slate-700 hover:bg-slate-600 text-white shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-500"
>
  <Plus className="w-4 h-4" />
  <span>Nuevo programa</span>
</DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-border flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-slate-600" />
            </div>
            <DialogTitle className="font-display text-base">
              Nuevo programa de posgrado
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-1">
          {/* ── Datos del programa ── */}
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Datos del programa
            </p>

            {/* Categoría */}
            <div className="space-y-1.5">
              <Label className="text-sm">Categoría</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => set("categoria", v as CategoriaPrograma)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {LABEL_CATEGORIA[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label className="text-sm">Nombre del programa *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Ej: Diplomado en Gestión Pública"
                className={cn(errores.nombre && "border-rose-300")}
              />
              <FieldError msg={errores.nombre} />
            </div>

            {/* Version + Gestión */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Versión</Label>
                <Input
                  value={form.version}
                  onChange={(e) => set("version", e.target.value)}
                  placeholder="SIN VERSION"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Gestión</Label>
                <Input
                  type="number"
                  value={form.gestion}
                  onChange={(e) => set("gestion", e.target.value)}
                  min={2020}
                  max={2040}
                />
              </div>
            </div>

            {/* Sede + Modalidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Sede</Label>
                <Select
                  value={form.sede}
                  onValueChange={(v) => v !== null && set("sede", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEDES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Modalidad</Label>
                <Select
                  value={form.modalidad}
                  onValueChange={(v) => v !== null && set("modalidad", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODALIDADES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cupos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Cupo mínimo</Label>
                <Input
                  type="number"
                  value={form.cupoMinimo}
                  onChange={(e) => set("cupoMinimo", e.target.value)}
                  min={1}
                  className={cn(errores.cupoMinimo && "border-rose-300")}
                />
                <FieldError msg={errores.cupoMinimo} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Cupo máximo</Label>
                <Input
                  type="number"
                  value={form.cupoMaximo}
                  onChange={(e) => set("cupoMaximo", e.target.value)}
                  min={1}
                  max={100}
                  className={cn(errores.cupoMaximo && "border-rose-300")}
                />
                <FieldError msg={errores.cupoMaximo} />
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Responsable y clave ── */}
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Acceso al sistema
            </p>

            <div className="space-y-1.5">
              <Label className="text-sm">Responsable de registro *</Label>
              <Input
                value={form.responsableRegistro}
                onChange={(e) => set("responsableRegistro", e.target.value)}
                placeholder="Nombre del responsable"
                className={cn(errores.responsableRegistro && "border-rose-300")}
              />
              <FieldError msg={errores.responsableRegistro} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Clave de sesión *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={mostrarPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className={cn(
                    "pl-9 pr-10",
                    errores.password && "border-rose-300",
                  )}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {mostrarPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <FieldError msg={errores.password} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Confirmar clave *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={mostrarPwd ? "text" : "password"}
                  value={form.passwordConfirm}
                  onChange={(e) => set("passwordConfirm", e.target.value)}
                  placeholder="Repite la clave"
                  className={cn(
                    "pl-9",
                    errores.passwordConfirm && "border-rose-300",
                  )}
                  autoComplete="new-password"
                />
              </div>
              <FieldError msg={errores.passwordConfirm} />
            </div>
          </section>

          {/* Acciones */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setAbierto(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear programa
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-rose-600 mt-0.5">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  );
}
