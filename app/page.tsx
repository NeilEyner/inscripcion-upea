import { obtenerTodasLasSesiones } from "@/lib/queries/sesiones";
import { SesionGrid } from "@/components/sesiones/SesionGrid";
import { NuevaSesionDialog } from "@/components/sesiones/NuevaSesionDialog";
import { GraduationCap, Building2 } from "lucide-react";

export const dynamic = "force-dynamic"; // siempre fresco, sin caché de rutas

export default async function PaginaPrincipal() {
  const sesiones = await obtenerTodasLasSesiones();

  const activas   = sesiones.filter((s) => s.activo).length;
  const inactivas = sesiones.filter((s) => !s.activo).length;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header institucional ─────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Marca */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700 border border-slate-600 shrink-0">
                <GraduationCap className="w-5 h-5 text-slate-200" />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-slate-400 leading-none mb-0.5">
                  Universidad Pública de El Alto
                </p>
                <h1 className="text-slate-100 font-display font-bold text-base leading-tight">
                  Control de Inscripciones
                </h1>
              </div>
            </div>

            {/* Acción principal */}
            <NuevaSesionDialog />
          </div>
        </div>
      </header>

      {/* ─── Barra de estado rápido ───────────────────────────── */}
      <div className="bg-slate-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>
              <strong className="text-foreground font-semibold">{sesiones.length}</strong>{" "}
              {sesiones.length === 1 ? "programa registrado" : "programas registrados"}
            </span>
          </div>
          <div className="h-3.5 w-px bg-border" />
          <span>
            <strong className="text-emerald-700 font-semibold">{activas}</strong> activos
          </span>
          {inactivas > 0 && (
            <>
              <div className="h-3.5 w-px bg-border" />
              <span>
                <strong className="text-slate-400 font-semibold">{inactivas}</strong> inactivos
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── Grid de programas ────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-16">
        {sesiones.length === 0 ? (
          <EmptyState />
        ) : (
          <SesionGrid sesiones={sesiones} />
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-border flex items-center justify-center">
        <GraduationCap className="w-8 h-8 text-slate-400" />
      </div>
      <div className="text-center space-y-1.5 max-w-sm">
        <h2 className="text-base font-semibold text-foreground">
          Sin programas registrados
        </h2>
        <p className="text-sm text-muted-foreground">
          Crea el primer programa de posgrado usando el botón superior para
          comenzar a gestionar inscripciones.
        </p>
      </div>
    </div>
  );
}