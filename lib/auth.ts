import { db } from "@/lib/db";
import { cookies } from "next/headers";

const SESSION_COOKIE_PREFIX = "pgposgrado_session_";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 horas

/**
 * Verifica la clave de sesión contra el hash almacenado en la BD
 * usando pgcrypto (crypt). La contraseña se almacenó con gen_salt('bf').
 */
export async function verificarClaveSesion(
  sesionId: string,
  password: string
): Promise<boolean> {
  try {
    const rows = await db`
      SELECT id
      FROM sesion_programa
      WHERE id = ${sesionId}
        AND password_hash = crypt(${password}, password_hash)
        AND activo = true
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Genera el hash de una contraseña usando pgcrypto (blowfish).
 * Usar al crear o cambiar la clave de una sesión.
 */
export async function hashearPassword(password: string): Promise<string> {
  const rows = await db`
    SELECT crypt(${password}, gen_salt('bf', 10)) AS hash
  `;
  return rows[0].hash as string;
}

/**
 * Guarda en una cookie httpOnly que el usuario está autenticado
 * para una sesión de programa específica.
 */
export async function guardarSesionAuth(sesionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`${SESSION_COOKIE_PREFIX}${sesionId}`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });
}

/**
 * Comprueba si el usuario ya está autenticado para una sesión de programa.
 */
export async function estaAutenticado(sesionId: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(`${SESSION_COOKIE_PREFIX}${sesionId}`);
}

/**
 * Elimina la cookie de autenticación (logout de un programa).
 */
export async function cerrarSesionAuth(sesionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(`${SESSION_COOKIE_PREFIX}${sesionId}`);
}