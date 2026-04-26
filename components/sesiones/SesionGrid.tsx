"use client";

import { useState } from "react";
import type { SesionStats } from "@/lib/types";
import { SesionCard } from "./SesionCard";
import { AuthModal } from "./AuthModal";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface SesionGridProps {
  sesiones: SesionStats[];
}

type Filtro = "todos" | "activos" | "inactivos";

export function SesionGrid({ sesiones }: SesionGridProps) {
  const [sesionSeleccionada, setSesionSeleccionada] =
    useState<SesionStats | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const sesionesFiltradas = sesiones.filter((s) => {
    if (filtro === "activos") return s.activo;
    if (filtro === "inactivos") return !s.activo;
    return true;
  });

  return (
    <>
      {/* ─── Barra de filtros ─────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        {(
          [
            { key: "todos",    label: "Todos",    count: sesiones.length },
            { key: "activos",  label: "Activos",  count: sesiones.filter((s) => s.activo).length },
            { key: "inactivos",label: "Inactivos",count: sesiones.filter((s) => !s.activo).length },
          ] as { key: Filtro; label: string; count: number }[]
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              filtro === f.key
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-slate-300 hover:text-foreground"
            )}
          >
            {filtro === f.key ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
            {f.label}
            <span
              className={cn(
                "ml-0.5 text-[11px] tabular-nums px-1.5 py-0.5 rounded-full font-semibold",
                filtro === f.key
                  ? "bg-slate-700 text-slate-200"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Grid ─────────────────────────────────────────────── */}
      {sesionesFiltradas.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No hay programas en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {sesionesFiltradas.map((sesion, i) => (
            <SesionCard
              key={sesion.id}
              sesion={sesion}
              index={i}
              onSeleccionar={setSesionSeleccionada}
            />
          ))}
        </div>
      )}

      {/* ─── Modal de autenticación ───────────────────────────── */}
      <AuthModal
        sesion={sesionSeleccionada}
        onCerrar={() => setSesionSeleccionada(null)}
      />
    </>
  );
}