// app/programa/[sesionId]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

// Queries
import { obtenerSesionStats } from "@/lib/queries/sesiones";
import { obtenerInscripcionesDeSesion } from "@/lib/queries/inscripciones";
import { obtenerRequisitosYDocumentos } from "@/lib/queries/documentos";
import { obtenerPagosDeSesion } from "@/lib/queries/pagos"; // ← NUEVO

// Componentes
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";
import BuscadorGlobal from "@/components/dashboard/BuscadorGlobal";
import ExportPdfButton from "@/components/dashboard/ExportPdfButton";
import NuevaInscripcionSheet from "@/components/participantes/NuevaInscripcionSheet";
import TablaParticipantes from "@/components/participantes/TablaParticipantes";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ sesionId: string }>;
  searchParams: Promise<{ q?: string }>;
}

/**
 * Generación de Metadatos
 */
export async function generateMetadata({ params }: PageProps) {
  const { sesionId } = await params;
  const sesion = await obtenerSesionStats(sesionId);
  return {
    title: sesion
      ? `${sesion.nombre} — Posgrado UPEA`
      : "Programa no encontrado",
  };
}

/**
 * ProgramaDashboardPage — Actualización Fase 6
 * Integra gestión de pagos y optimización de fetching.
 */
export default async function ProgramaDashboardPage({
  params,
  searchParams,
}: PageProps) {
  const { sesionId } = await params;
  const { q = "" } = await searchParams;
  const queryLimpia = q.trim();

  // ── 1. Verificar sesión (Cookie HttpOnly) ──────────────────────────
  const cookieStore = await cookies();
  const cookieSesion = cookieStore.get(`pgposgrado_session_${sesionId}`);

  if (!cookieSesion) {
    redirect("/");
  }

  // ── 2. Fetch paralelo de datos (Corregido) ─────────────────────────────
  const [sesion, inscripciones, documentosData, pagosData] = await Promise.all([
    obtenerSesionStats(sesionId),
    obtenerInscripcionesDeSesion(sesionId, queryLimpia || undefined),
    obtenerRequisitosYDocumentos(sesionId),
    obtenerPagosDeSesion(sesionId),
  ]);

  // Extraemos los valores con "fallbacks" (valores por defecto)
  // Si documentosData es null, usamos un objeto vacío para que no explote
  const requisitos = documentosData?.requisitos ?? [];
  const documentosMap = documentosData?.documentosMap ?? {};
  const pagosMap = pagosData ?? {};
  if (!sesion) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header sticky */}
      <DashboardHeader sesion={sesion} sesionId={sesionId} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {/* KPIs */}
        <StatsBar sesion={sesion} />

        {/* Barra de acciones */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full sm:max-w-md">
            <Suspense fallback={<Skeleton className="h-9 w-full" />}>
              <BuscadorGlobal busquedaInicial={queryLimpia} />
            </Suspense>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ExportPdfButton
              sesionNombre={sesion.nombre}
              inscripciones={inscripciones}
              documentosMap={documentosMap}
              requisitos={requisitos}
              pagosMap={pagosMap}
            />
          </div>
        </div>

        {/* ── Tabla de participantes ────────────────────────────────── */}
        <div className="mt-4">
          <Suspense fallback={<TablaSkeleton />}>
            <TablaParticipantes
              sesionId={sesionId}
              inscripciones={inscripciones}
              requisitos={requisitos}
              documentosMap={documentosMap}
              pagosMap={pagosMap} // ← NUEVO
              busqueda={queryLimpia || undefined}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

/**
 * Skeleton de carga para la tabla
 */
export function TablaSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3 bg-slate-50 flex gap-4">
        {[120, 200, 110, 90, 70, 70, 70].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="border-b border-slate-50 px-4 py-3.5 flex gap-4 items-center"
        >
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      ))}
    </div>
  );
}
