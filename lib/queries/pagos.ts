import { db } from "@/lib/db";
import type { Pago } from "@/lib/types";

/**
 * Obtiene todos los pagos de las inscripciones de una sesión,
 * retornando un mapa inscripcionId → Pago[] para uso en el dashboard.
 */
export async function obtenerPagosDeSesion(
  sesionId: string
): Promise<Record<string, Pago[]>> {
  const rows = await db<
    (Pago & { inscripcionId: string })[]
  >`
    SELECT
      p.id,
      p.inscripcion_id  AS "inscripcionId",
      p.nro_boleta      AS "nroBoleta",
      p.monto,
      p.tipo,
      p.metodo,
      p.fecha_pago      AS "fechaPago",
      p.observaciones
    FROM pago p
    JOIN inscripcion i ON i.id = p.inscripcion_id
    WHERE i.sesion_id = ${sesionId}
    ORDER BY p.fecha_pago DESC
  `;

  // Agrupar por inscripcionId
  return rows.reduce<Record<string, Pago[]>>((acc, row) => {
    const { inscripcionId, ...pago } = row;
    if (!acc[inscripcionId]) acc[inscripcionId] = [];
    acc[inscripcionId].push(pago as Pago);
    return acc;
  }, {});
}

/**
 * Obtiene los pagos de una inscripción específica (para refetch puntual).
 */
export async function obtenerPagosDeInscripcion(
  inscripcionId: string
): Promise<Pago[]> {
  return db<Pago[]>`
    SELECT
      id,
      nro_boleta    AS "nroBoleta",
      monto,
      tipo,
      metodo,
      fecha_pago    AS "fechaPago",
      observaciones
    FROM pago
    WHERE inscripcion_id = ${inscripcionId}
    ORDER BY fecha_pago DESC
  `;
}