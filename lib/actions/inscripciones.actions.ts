"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { EstadoInscripcion } from "@/lib/types";

// ── Tipos de entrada ──────────────────────────────────────────────────────

export type CrearInscripcionInput = {
  sesionId: string;
  // Participante
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo?: string;
  celular?: string;
  // Inscripción
  estadoInscripcion?: EstadoInscripcion;
  tipoDescuento?: string;
  descuentoPorcentaje?: number;
  observacionesGenerales?: string;
};

export type ActualizarInscripcionInput = {
  inscripcionId: string;
  sesionId: string;
  estadoInscripcion: EstadoInscripcion;
  tipoDescuento?: string;
  descuentoPorcentaje?: number;
  observacionesGenerales?: string;
};

export type ActualizarParticipanteInput = {
  participanteId: string;
  sesionId: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo?: string;
  celular?: string;
};

export type ActionResult =
  | { success: true; mensaje: string; id?: string }
  | { success: false; error: string };

// ── Actions ───────────────────────────────────────────────────────────────

/**
 * Registra una nueva inscripción.
 * Hace UPSERT del participante por CI (puede existir de otro programa),
 * luego inserta la inscripción. El trigger auto-genera los control_documento.
 */
export async function crearInscripcion(
  input: CrearInscripcionInput
): Promise<ActionResult> {
  const {
    sesionId,
    ci,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    correo,
    celular,
    estadoInscripcion = "preinscrito",
    tipoDescuento,
    descuentoPorcentaje = 0,
    observacionesGenerales,
  } = input;

  try {
    // 1. UPSERT participante por CI
    const [participante] = await db<{ id: string }[]>`
      INSERT INTO participante (ci, nombres, apellido_paterno, apellido_materno, correo, celular)
      VALUES (
        ${ci.trim().toUpperCase()},
        ${nombres.trim()},
        ${apellidoPaterno.trim()},
        ${apellidoMaterno?.trim() ?? null},
        ${correo?.trim() ?? null},
        ${celular?.trim() ?? null}
      )
      ON CONFLICT (ci) DO UPDATE SET
        nombres          = EXCLUDED.nombres,
        apellido_paterno = EXCLUDED.apellido_paterno,
        apellido_materno = COALESCE(EXCLUDED.apellido_materno, participante.apellido_materno),
        correo           = COALESCE(EXCLUDED.correo, participante.correo),
        celular          = COALESCE(EXCLUDED.celular, participante.celular)
      RETURNING id
    `;

    // 2. Insertar inscripción (el trigger crea los documentos)
    const [inscripcion] = await db<{ id: string }[]>`
      INSERT INTO inscripcion (
        participante_id, sesion_id, estado_inscripcion,
        tipo_descuento, descuento_porcentaje, observaciones_generales
      )
      VALUES (
        ${participante.id},
        ${sesionId},
        ${estadoInscripcion},
        ${tipoDescuento ?? null},
        ${descuentoPorcentaje},
        ${observacionesGenerales ?? null}
      )
      RETURNING id
    `;

    revalidatePath(`/programa/${sesionId}`);

    return {
      success: true,
      mensaje: "Inscripción registrada correctamente.",
      id: inscripcion.id,
    };
  } catch (err: unknown) {
    console.error("[crearInscripcion]", err);

    // Violación de unique constraint (participante ya inscrito en esta sesión)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return {
        success: false,
        error: "Este participante ya está inscrito en el programa.",
      };
    }

    return { success: false, error: "No se pudo registrar la inscripción." };
  }
}

/**
 * Actualiza estado e información administrativa de una inscripción.
 */
export async function actualizarInscripcion(
  input: ActualizarInscripcionInput
): Promise<ActionResult> {
  const {
    inscripcionId,
    sesionId,
    estadoInscripcion,
    tipoDescuento,
    descuentoPorcentaje,
    observacionesGenerales,
  } = input;

  try {
    await db`
      UPDATE inscripcion SET
        estado_inscripcion     = ${estadoInscripcion},
        tipo_descuento         = ${tipoDescuento ?? null},
        descuento_porcentaje   = ${descuentoPorcentaje ?? 0},
        observaciones_generales = ${observacionesGenerales ?? null}
      WHERE id = ${inscripcionId}
    `;

    revalidatePath(`/programa/${sesionId}`);
    return { success: true, mensaje: "Inscripción actualizada." };
  } catch (err) {
    console.error("[actualizarInscripcion]", err);
    return { success: false, error: "No se pudo actualizar la inscripción." };
  }
}

/**
 * Actualiza los datos personales del participante.
 */
export async function actualizarParticipante(
  input: ActualizarParticipanteInput
): Promise<ActionResult> {
  const {
    participanteId,
    sesionId,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    correo,
    celular,
  } = input;

  try {
    await db`
      UPDATE participante SET
        nombres          = ${nombres.trim()},
        apellido_paterno = ${apellidoPaterno.trim()},
        apellido_materno = ${apellidoMaterno?.trim() ?? null},
        correo           = ${correo?.trim() ?? null},
        celular          = ${celular?.trim() ?? null}
      WHERE id = ${participanteId}
    `;

    revalidatePath(`/programa/${sesionId}`);
    return { success: true, mensaje: "Datos del participante actualizados." };
  } catch (err) {
    console.error("[actualizarParticipante]", err);
    return { success: false, error: "No se pudo actualizar el participante." };
  }
}