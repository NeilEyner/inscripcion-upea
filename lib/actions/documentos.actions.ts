"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { EstadoDocumento } from "@/lib/types";
export type ActualizarDocumentoInput = {
  inscripcionId: string;
  plantillaId: number;
  estado: EstadoDocumento;
  observaciones?: string;
};
 
export type ActualizarDocumentoResult =
  | { success: true; mensaje: string }
  | { success: false; error: string };
export type ActionResult = 
  | { ok: true; data?: any } 
  | { ok: false; error: string };

/**
 * Actualiza el estado de un documento de control.
 * Si el estado es 'entregado', registra la fecha actual automáticamente.
 * Si se revierte, limpia la fecha.
 */
export async function actualizarEstadoDocumento(
  input: ActualizarDocumentoInput
): Promise<ActualizarDocumentoResult> {
  const { inscripcionId, plantillaId, estado, observaciones } = input;
 
  try {
    await db`
      INSERT INTO control_documento (inscripcion_id, plantilla_id, estado, fecha_entrega, observaciones)
      VALUES (
        ${inscripcionId},
        ${plantillaId},
        ${estado},
        ${estado === "entregado" ? db`NOW()` : null},
        ${observaciones ?? null}
      )
      ON CONFLICT (inscripcion_id, plantilla_id)
      DO UPDATE SET
        estado        = EXCLUDED.estado,
        fecha_entrega = CASE
                          WHEN EXCLUDED.estado = 'entregado' THEN NOW()
                          ELSE NULL
                        END,
        observaciones = COALESCE(EXCLUDED.observaciones, control_documento.observaciones)
    `;
 
    // Obtener sesion_id para revalidar la ruta correcta
    const [row] = await db<{ sesionId: string }[]>`
      SELECT i.sesion_id AS "sesionId"
      FROM inscripcion i
      WHERE i.id = ${inscripcionId}
      LIMIT 1
    `;
 
    if (row?.sesionId) {
      revalidatePath(`/programa/${row.sesionId}`);
    }
 
    return {
      success: true,
      mensaje:
        estado === "entregado"
          ? "Documento marcado como entregado."
          : `Estado actualizado a "${estado}".`,
    };
  } catch (err) {
    console.error("[actualizarEstadoDocumento]", err);
    return {
      success: false,
      error: "No se pudo actualizar el documento. Intenta de nuevo.",
    };
  }
}

/**
 * Marca múltiples documentos como entregados en una sola operación.
 * Útil para operaciones de drag & drop en lote.
 */
export async function marcarDocumentosEntregados(
  controlDocumentoIds: number[],
  sesionId: string
): Promise<ActionResult> {
  if (controlDocumentoIds.length === 0) {
    return { ok: true, data: undefined };
  }
  try {
    await db`
      UPDATE control_documento
      SET
        estado        = 'entregado',
        fecha_entrega = NOW()
      WHERE id = ANY(${controlDocumentoIds}::bigint[])
    `;

    revalidatePath(`/programa/${sesionId}`);
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[marcarDocumentosEntregados]", error);
    return { ok: false, error: "No se pudieron marcar los documentos." };
  }
}

/**
 * Actualiza observaciones de un documento sin cambiar su estado.
 */
export async function actualizarObservacionDocumento(
  controlDocumentoId: number,
  observaciones: string,
  sesionId: string
): Promise<ActionResult> {
  try {
    await db`
      UPDATE control_documento
      SET observaciones = ${observaciones}
      WHERE id = ${controlDocumentoId}
    `;

    revalidatePath(`/programa/${sesionId}`);
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[actualizarObservacionDocumento]", error);
    return { ok: false, error: "No se pudo guardar la observación." };
  }
}



/** Mapa de transiciones válidas de estado para documentos */

/**
 * Entrega masiva: marca todos los documentos pendientes de una inscripción como entregados.
 * Útil para el panel lateral de ficha del participante.
 */
export async function entregarTodosDocumentos(
  inscripcionId: string
): Promise<ActualizarDocumentoResult> {
  try {
    await db`
      UPDATE control_documento
      SET
        estado        = 'entregado',
        fecha_entrega = NOW()
      WHERE inscripcion_id = ${inscripcionId}
        AND estado = 'pendiente'
    `;
 
    const [row] = await db<{ sesionId: string }[]>`
      SELECT sesion_id AS "sesionId" FROM inscripcion WHERE id = ${inscripcionId} LIMIT 1
    `;
    if (row?.sesionId) revalidatePath(`/programa/${row.sesionId}`);
 
    return { success: true, mensaje: "Todos los documentos pendientes marcados como entregados." };
  } catch (err) {
    console.error("[entregarTodosDocumentos]", err);
    return { success: false, error: "Error al actualizar documentos." };
  }
}