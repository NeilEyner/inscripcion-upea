"use server";

import { redirect } from "next/navigation";
import { verificarClaveSesion, guardarSesionAuth, cerrarSesionAuth } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

/**
 * Verifica la clave y guarda la cookie de sesión.
 * Devuelve error si la clave es incorrecta.
 * Si es correcta, redirige al dashboard del programa.
 */
export async function loginSesion(
  sesionId: string,
  password: string
): Promise<ActionResult> {
  const valido = await verificarClaveSesion(sesionId, password);

  if (!valido) {
    return { ok: false, error: "Clave de sesión incorrecta." };
  }

  await guardarSesionAuth(sesionId);
  redirect(`/programa/${sesionId}`);
}

/** Cierra la sesión de un programa y redirige al inicio */
export async function logoutSesion(sesionId: string): Promise<void> {
  await cerrarSesionAuth(sesionId);
  redirect("/");
}