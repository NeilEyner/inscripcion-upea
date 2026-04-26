"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SesionStats } from "@/lib/types";
import { COLOR_CATEGORIA, LABEL_CATEGORIA } from "@/lib/types";
import { loginSesion } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  MapPin,
  Monitor,
  AlertCircle,
} from "lucide-react";

interface AuthModalProps {
  sesion: SesionStats | null;
  onCerrar: () => void;
}

export function AuthModal({ sesion, onCerrar }: AuthModalProps) {
  const [password, setPassword] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const colores = sesion ? COLOR_CATEGORIA[sesion.categoria] : null;

  function handleCerrar() {
    if (isPending) return;
    setPassword("");
    setError(null);
    setMostrar(false);
    onCerrar();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sesion || !password.trim()) return;

    setError(null);

    startTransition(async () => {
      const result = await loginSesion(sesion.id, password.trim());

      // Si llega aquí, hubo un error (el éxito hace redirect y no retorna)
      if (result && !result.ok) {
        setError(result.error);
        setPassword("");
        // Focus de regreso al input
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    });
  }

  return (
    <Dialog open={!!sesion} onOpenChange={(open) => !open && handleCerrar()}>
      <DialogContent className="sm:max-w-md">
        {sesion && colores && (
          <>
            {/* Barra de categoría */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1 rounded-t-lg",
                colores.accent,
              )}
            />

            <DialogHeader className="pt-2">
              {/* Ícono + badge */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    colores.bg,
                    colores.border,
                  )}
                >
                  <GraduationCap className={cn("w-5 h-5", colores.text)} />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold tracking-wide uppercase",
                    colores.bg,
                    colores.text,
                    colores.border,
                  )}
                >
                  {LABEL_CATEGORIA[sesion.categoria]}
                </Badge>
              </div>

              <DialogTitle className="font-display text-[17px] leading-snug">
                {sesion.nombre}
              </DialogTitle>

              <DialogDescription>
                {/* Cambiamos div por span y quitamos asChild */}
                <span className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-foreground/70">
                    {sesion.version}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {sesion.sede}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    {sesion.modalidad}
                  </span>
                </span>
              </DialogDescription>
            </DialogHeader>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="password-sesion"
                  className="text-sm font-medium"
                >
                  Clave de sesión
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password-sesion"
                    ref={inputRef}
                    type={mostrar ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ingresa la clave del programa"
                    className={cn(
                      "pl-9 pr-10",
                      error && "border-rose-300 focus-visible:ring-rose-300",
                    )}
                    disabled={isPending}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {mostrar ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCerrar}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isPending || !password.trim()}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Ingresar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
