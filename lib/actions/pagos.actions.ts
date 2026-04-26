"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { TipoPago, MetodoPago } from "@/lib/types";

export type RegistrarPagoInput = {
  inscripcionId: string;
  sesionId: string;
  nroBoleta?: string;
  monto: number;
  tipo: TipoPago;
  metodo: MetodoPago;
  observaciones?: string;
};

export type EliminarPagoInput = {
  pagoId: string;
  sesionId: string;
};

export type ActionResult =
  | { success: true; mensaje: string; id?: string }
  | { success: false; error: string };

/**
 * Registra un nuevo pago para una inscripción.
 */
export async function registrarPago(
  input: RegistrarPagoInput
): Promise<ActionResult> {
  const {
    inscripcionId,
    sesionId,
    nroBoleta,
    monto,
    tipo,
    metodo,
    observaciones,
  } = input;

  if (!monto || monto <= 0) {
    return { success: false, error: "El monto debe ser mayor a 0." };
  }

  try {
    const [pago] = await db<{ id: string }[]>`
      INSERT INTO pago (inscripcion_id, nro_boleta, monto, tipo, metodo, observaciones)
      VALUES (
        ${inscripcionId},
        ${nroBoleta?.trim() ?? null},
        ${monto},
        ${tipo},
        ${metodo},
        ${observaciones?.trim() ?? null}
      )
      RETURNING id
    `;

    revalidatePath(`/programa/${sesionId}`);
    return { success: true, mensaje: "Pago registrado correctamente.", id: pago.id };
  } catch (err) {
    console.error("[registrarPago]", err);
    return { success: false, error: "No se pudo registrar el pago." };
  }
}

/**
 * Elimina un pago por ID (por errores de captura).
 */
export async function eliminarPago(
  input: EliminarPagoInput
): Promise<ActionResult> {
  const { pagoId, sesionId } = input;

  try {
    await db`DELETE FROM pago WHERE id = ${pagoId}`;
    revalidatePath(`/programa/${sesionId}`);
    return { success: true, mensaje: "Pago eliminado." };
  } catch (err) {
    console.error("[eliminarPago]", err);
    return { success: false, error: "No se pudo eliminar el pago." };
  }
}