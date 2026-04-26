"use client";

import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import type { DropData } from "@/components/dnd/DndProvider";

type UseDocumentoDropParams = {
  inscripcionId: string;
  plantillaId: number;
  /** Si el documento ya está en estado final no necesita ser drop target */
  deshabilitado?: boolean;
};

/**
 * Hook que convierte un DocumentoBadge en un drop zone de @dnd-kit.
 *
 * Retorna:
 * - `setNodeRef` para enlazar al DOM
 * - `isOver`     para aplicar estilos de hover-drop
 * - `canDrop`    true cuando el ítem arrastrado tiene el mismo plantillaId
 */
export function useDocumentoDrop({
  inscripcionId,
  plantillaId,
  deshabilitado = false,
}: UseDocumentoDropParams) {
  const dropData: DropData = useMemo(
    () => ({ type: "badge", inscripcionId, plantillaId }),
    [inscripcionId, plantillaId]
  );

  const { setNodeRef, isOver, active } = useDroppable({
    id: `drop-${inscripcionId}-${plantillaId}`,
    data: dropData,
    disabled: deshabilitado,
  });

  // ¿El ítem activo arrastra el mismo plantillaId?
  const canDrop =
    !deshabilitado &&
    !!active &&
    (active.data.current as { plantillaId?: number } | undefined)?.plantillaId === plantillaId;

  return { setNodeRef, isOver, canDrop };
}