import { db } from "@/lib/db";
import type { SesionPrograma, SesionStats } from "@/lib/types";

/** Todas las sesiones activas + inactivas, ordenadas por más reciente */
export async function obtenerTodasLasSesiones(): Promise<SesionStats[]> {
  const rows = await db`
    SELECT *
    FROM vista_sesion_stats
    ORDER BY
      creado_en DESC,
      activo DESC,
      gestion DESC,
      nombre ASC
  `;
  return rows as unknown as SesionStats[];
}

/** Una sesión por su ID (incluye password_hash para verificación) */
export async function obtenerSesionPorId(
  id: string
): Promise<SesionPrograma | null> {
  const rows = await db`
    SELECT *
    FROM sesion_programa
    WHERE id = ${id}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as SesionPrograma;
}

/** Stats de una sesión específica */
export async function obtenerSesionStats(
  id: string
): Promise<SesionStats | null> {
  const rows = await db`
    SELECT *
    FROM vista_sesion_stats
    WHERE id = ${id}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as SesionStats;
}