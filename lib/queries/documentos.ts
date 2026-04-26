import { db } from "@/lib/db";
import type {
  DocumentoConPlantilla,
  DocumentoControl,
  PlantillaRequisito,
  CategoriaPrograma,
} from "@/lib/types";

/**
 * Documentos de una inscripción específica, con metadata de plantilla.
 */
export async function obtenerDocumentosDeInscripcion(
  inscripcionId: string
): Promise<DocumentoConPlantilla[]> {
  const rows = await db`
    SELECT
      cd.id,
      cd.inscripcion_id,
      cd.plantilla_id,
      cd.estado,
      cd.fecha_entrega,
      cd.archivo_url,
      cd.observaciones,
      pr.nombre_documento,
      pr.descripcion_detalle
    FROM control_documento cd
    JOIN plantilla_requisito pr ON pr.id = cd.plantilla_id
    WHERE cd.inscripcion_id = ${inscripcionId}
    ORDER BY pr.id ASC
  `;
  return rows as unknown as DocumentoConPlantilla[];
}

/**
 * Plantilla de requisitos por categoría de programa.
 */
export async function obtenerPlantillaPorCategoria(
  categoria: CategoriaPrograma
): Promise<PlantillaRequisito[]> {
  const rows = await db`
    SELECT *
    FROM plantilla_requisito
    WHERE categoria = ${categoria}
    ORDER BY id ASC
  `;
  return rows as unknown as PlantillaRequisito[];
}

/**
 * Documentos de TODAS las inscripciones de una sesión (para la tabla del dashboard).
 * Devuelve un mapa: inscripcion_id → DocumentoConPlantilla[]
 */
export async function obtenerDocumentosDeSesion(
  sesionId: string
): Promise<Record<string, DocumentoConPlantilla[]>> {
  const rows = await db`
    SELECT
      cd.id,
      cd.inscripcion_id,
      cd.plantilla_id,
      cd.estado,
      cd.fecha_entrega,
      cd.archivo_url,
      cd.observaciones,
      pr.nombre_documento,
      pr.descripcion_detalle
    FROM control_documento cd
    JOIN plantilla_requisito pr ON pr.id = cd.plantilla_id
    JOIN inscripcion i ON i.id = cd.inscripcion_id
    WHERE i.sesion_id = ${sesionId}
      AND i.estado_inscripcion != 'cancelado'
    ORDER BY cd.inscripcion_id, pr.id ASC
  `;

  const mapa: Record<string, DocumentoConPlantilla[]> = {};
  for (const row of rows as unknown as DocumentoConPlantilla[]) {
    const key = row.inscripcionId;
    if (!mapa[key]) mapa[key] = [];
    mapa[key].push(row);
  }
  return mapa;
}

/**
 * obtenerDocumentosDeSesion
 * ─────────────────────────
 * Devuelve un mapa inscripcionId → DocumentoControl[] con TODOS los
 * documentos de todas las inscripciones activas de la sesión.
 *
 * Una sola query en lugar de N queries (una por participante).
 * page.tsx la llama en paralelo con obtenerInscripcionesDeSesion.
 */
// export async function obtenerDocumentosDeSesion(
//   sesionId: string
// ): Promise<Record<string, DocumentoControl[]>> {
//   const rows = await db<DocumentoControl[]>`
//     SELECT cd.*
//     FROM   control_documento cd
//     JOIN   inscripcion i ON i.id = cd.inscripcion_id
//     WHERE  i.sesion_id          = ${sesionId}
//       AND  i.estado_inscripcion != 'cancelado'
//     ORDER BY cd.plantilla_id
//   `

//   // Agrupar por inscripcion_id en un solo recorrido O(n)
//   return rows.reduce<Record<string, DocumentoControl[]>>((acc, doc) => {
//     if (!acc[doc.inscripcionId]) acc[doc.inscripcionId] = []
//     acc[doc.inscripcionId].push(doc)
//     return acc
//   }, {})
// }

/**
 * obtenerRequisitosDeSesion
 * ─────────────────────────
 * Devuelve la lista de PlantillaRequisito para la categoría del programa.
 * Estos son los encabezados de columnas de documentos en TablaParticipantes.
 * Ordenados por id (el orden de inserción original del seed).
 */
export async function obtenerRequisitosDeSesion(
  sesionId: string
): Promise<PlantillaRequisito[]> {
  return db<PlantillaRequisito[]>`
    SELECT pr.*
    FROM   plantilla_requisito pr
    JOIN   sesion_programa sp ON sp.categoria = pr.categoria
    WHERE  sp.id = ${sesionId}
    ORDER BY pr.id
  `
}
/**
 * Obtiene tanto la plantilla de requisitos como los documentos entregados 
 * de una inscripción específica. Útil para el formulario de edición de un alumno.
 */
export async function obtenerRequisitosYDocumentos(sesionId: string) {
  const [sessionInfo] = await db`
    SELECT categoria FROM sesion_programa WHERE id = ${sesionId}
  `;
  if (!sessionInfo) return { requisitos: [], documentosMap: {} };

  const [requisitos, documentosMap] = await Promise.all([
    obtenerPlantillaPorCategoria(sessionInfo.categoria as CategoriaPrograma),
    obtenerDocumentosDeSesion(sesionId),
  ]);

  return { requisitos, documentosMap };
}