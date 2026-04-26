"use client";

import { cn } from "@/lib/utils";
import type { SesionStats } from "@/lib/types";
import { COLOR_CATEGORIA, LABEL_CATEGORIA } from "@/lib/types";
import {
  MapPin,
  Monitor,
  Users,
  CheckCircle2,
  Clock,
  Lock,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SesionCardProps {
  sesion: SesionStats;
  index: number;
  onSeleccionar: (sesion: SesionStats) => void;
}

export function SesionCard({ sesion, index, onSeleccionar }: SesionCardProps) {
  const colores = COLOR_CATEGORIA[sesion.categoria];
  const ocupacion =
    sesion.cupoMaximo > 0
      ? Math.min(
          100,
          Math.round((sesion.totalInscritos / sesion.cupoMaximo) * 100),
        )
      : 0;

  const cupoLibre = Math.max(0, sesion.cupoMaximo - sesion.totalInscritos);
  const alcanzaMinimo = sesion.totalInscritos >= sesion.cupoMinimo;

  // Color de la barra de capacidad según ocupación
  const barColor =
    ocupacion >= 90
      ? "bg-rose-400"
      : ocupacion >= 70
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <button
      onClick={() => onSeleccionar(sesion)}
      className={cn(
        "card-animate group w-full text-left bg-card border border-border rounded-xl",
        "overflow-hidden shadow-sm transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !sesion.activo && "opacity-60 grayscale-30",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >

      <div className="p-2 space-y-2">
        {/* Fila superior: categoría + estado */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5",
              colores.bg,
              colores.text,
              colores.border,
            )}
          >
            {LABEL_CATEGORIA[sesion.categoria]}
          </Badge>

          <div className="flex items-center gap-1.5 shrink-0">
            {!sesion.activo && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Lock className="w-3 h-3" />
                Inactivo
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {/* Nombre del programa */}
          <h3 className="font-display font-bold text-foreground text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors uppercase">
            {sesion.nombre}
          </h3>
          {/* Metadatos en una sola fila */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[8px] text-muted-foreground">
            {/* Gestión y Versión */}
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 shrink-0" />
              <span>{sesion.gestion}</span>
              <span className="text-border">·</span>
              <span className="font-medium text-foreground/70">
                {sesion.version}
              </span>
            </div>
            <span className="hidden sm:inline text-border">·</span>
            {/* Sede */}
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{sesion.sede}</span>
            </div>

            <span className="text-border">·</span>

            {/* Modalidad */}
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3 shrink-0" />
              <span>{sesion.modalidad}</span>
            </div>
          </div>
        </div>

        {/* Barra de capacidad */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">
              Ocupación del cupo
            </span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                ocupacion >= 90 ? "text-rose-600" : "text-foreground",
              )}
            >
              {sesion.totalInscritos} / {sesion.cupoMaximo}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                barColor,
              )}
              style={{ width: `${ocupacion}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span
              className={cn(
                "flex items-center gap-0.5",
                alcanzaMinimo ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {alcanzaMinimo ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              Mínimo: {sesion.cupoMinimo}
            </span>
            {cupoLibre > 0 && <span>{cupoLibre} lugares disponibles</span>}
          </div>
        </div>

        {/* Stats: confirmados / preinscritos / recaudado */}
        <div className="grid grid-cols-2 gap-2">
          <StatChip
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            valor={sesion.totalConfirmados}
            label="Confirmados"
            colorValor="text-emerald-700"
          />
          <StatChip
            icon={<Clock className="w-3.5 h-3.5 text-blue-400" />}
            valor={sesion.totalPreinscritos}
            label="Preinscritos"
            colorValor="text-blue-700"
          />
          {/* <StatChip
            icon={<TrendingUp className="w-3.5 h-3.5 text-slate-400" />}
            valor={formatBs(sesion.totalRecaudado)}
            label="Recaudado"
            colorValor="text-slate-700"
            small
          /> */}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{sesion.totalInscritos} inscritos en total</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-primary font-semibold group-hover:gap-2 transition-all">
          <Lock className="w-3 h-3" />
          <span>Ingresar</span>
        </div>
      </div>
    </button>
  );
}

// ─── Subcomponente: chip de estadística ────────────────────
function StatChip({
  icon,
  valor,
  label,
  colorValor,
  small = false,
}: {
  icon: React.ReactNode;
  valor: number | string;
  label: string;
  colorValor: string;
  small?: boolean;
}) {
  return (
    <div className="bg-muted/60 rounded-lg p-2.5 text-center space-y-0.5">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span
          className={cn(
            "font-bold tabular-nums",
            small ? "text-[12px]" : "text-sm",
            colorValor,
          )}
        >
          {valor}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

// ─── Utilidad de formato monetario ─────────────────────────
// src/components/sesiones/SesionCard.tsx

const formatBs = (monto: any) => {
  // 1. Convertimos a número por si viene como string o null
  const numMonto = Number(monto || 0);

  // 2. Usamos el nuevo valor numMonto para los cálculos
  if (numMonto >= 1000) {
    return `Bs ${(numMonto / 1000).toFixed(1)}k`;
  }

  return `Bs ${numMonto.toFixed(0)}`;
};
