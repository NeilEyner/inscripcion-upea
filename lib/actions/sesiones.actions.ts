"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashearPassword } from "@/lib/auth";
import type { ActionResult, CrearSesionInput } from "@/lib/types";
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'


/** Crea una nueva sesión de programa */
export async function crearSesion(
  input: CrearSesionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const passwordHash = await hashearPassword(input.password);

    const rows = await db`
      INSERT INTO sesion_programa (
        categoria,
        nombre,
        version,
        gestion,
        sede,
        modalidad,
        cupo_minimo,
        cupo_maximo,
        responsable_registro,
        password_hash
      ) VALUES (
        ${input.categoria},
        ${input.nombre},
        ${input.version ?? "SIN VERSION"},
        ${input.gestion ?? 2026},
        ${input.sede ?? "EL ALTO"},
        ${input.modalidad ?? "VIRTUAL"},
        ${input.cupoMinimo ?? 20},
        ${input.cupoMaximo ?? 50},
        ${input.responsableRegistro},
        ${passwordHash}
      )
      RETURNING id
    `;

    revalidatePath("/");
    return { ok: true, data: { id: rows[0].id as string } };
  } catch (error) {
    console.error("[crearSesion]", error);
    return { ok: false, error: "No se pudo crear el programa." };
  }
}

/** Activa o desactiva una sesión */
export async function toggleActivoSesion(
  sesionId: string,
  activo: boolean
): Promise<ActionResult> {
  try {
    await db`
      UPDATE sesion_programa
      SET activo = ${activo}
      WHERE id = ${sesionId}
    `;
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[toggleActivoSesion]", error);
    return { ok: false, error: "No se pudo actualizar el estado del programa." };
  }
}
export async function logoutSesion(sesionId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(`pgposgrado_session_${sesionId}`)
  redirect('/')
}
