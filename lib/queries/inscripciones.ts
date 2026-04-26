import { db } from "@/lib/db";
import type { InscripcionDetalle } from "@/lib/types";

/**
 * Lista de inscripciones detalladas de una sesión.
 * Soporta búsqueda opcional por CI o nombre completo.
 */
export async function obtenerInscripcionesDeSesion(
  sesionId: string,
  busqueda?: string
): Promise<InscripcionDetalle[]> {
  if (busqueda && busqueda.trim().length > 0) {
    const termino = `%${busqueda.trim().toLowerCase()}%`;
    const rows = await db`
      SELECT *
      FROM vista_inscripcion_detalle
      WHERE sesion_id = ${sesionId}
        AND estado_inscripcion != 'cancelado'
        AND (
          LOWER(ci) LIKE ${termino}
          OR LOWER(nombre_completo) LIKE ${termino}
          OR LOWER(nombres) LIKE ${termino}
          OR LOWER(apellido_paterno) LIKE ${termino}
        )
      ORDER BY fecha_inscripcion DESC
    `;
    return rows as unknown as InscripcionDetalle[];
  }

  const rows = await db`
    SELECT *
    FROM vista_inscripcion_detalle
    WHERE sesion_id = ${sesionId}
      AND estado_inscripcion != 'cancelado'
    ORDER BY fecha_inscripcion DESC
  `;
  return rows as unknown as InscripcionDetalle[];
}

/** Detalle de una inscripción específica */
export async function obtenerInscripcionDetalle(
  inscripcionId: string
): Promise<InscripcionDetalle | null> {
  const rows = await db`
    SELECT *
    FROM vista_inscripcion_detalle
    WHERE id = ${inscripcionId}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as InscripcionDetalle;
}
