import { db } from "@/lib/db";
import type { Participante } from "@/lib/types";

/** Buscar participante por CI (exacto) */
export async function obtenerParticipantePorCI(
  ci: string
): Promise<Participante | null> {
  const rows = await db`
    SELECT *
    FROM participante
    WHERE ci = ${ci}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as Participante;
}

/** Buscar participante por ID */
export async function obtenerParticipantePorId(
  id: string
): Promise<Participante | null> {
  const rows = await db`
    SELECT *
    FROM participante
    WHERE id = ${id}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as Participante;
}