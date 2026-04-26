"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { FileText } from "lucide-react";
import { useState, useCallback, createContext, useContext } from "react";
import { toast } from "sonner";
import { actualizarEstadoDocumento } from "@/lib/actions/documentos.actions";

// ── Tipo del item arrastrable ──────────────────────────────────────────────
export type DragData = {
  type: "documento";
  plantillaId: number;
  nombreDocumento: string;
};

// ── Tipo del drop target ───────────────────────────────────────────────────
export type DropData = {
  type: "badge";
  inscripcionId: string;
  plantillaId: number;
};

// ── Contexto para saber si hay un drag activo (optimización visual) ────────
type DndActiveCtx = { isDragging: boolean; activeName: string | null };
const DndActiveContext = createContext<DndActiveCtx>({
  isDragging: false,
  activeName: null,
});
export const useDndActive = () => useContext(DndActiveContext);

// ── Provider principal ─────────────────────────────────────────────────────
export default function DndProvider({ children }: { children: React.ReactNode }) {
  const [activeData, setActiveData] = useState<DragData | null>(null);

  // Sensores: Mouse con 8px de tolerancia, Touch con 250ms delay
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (data?.type === "documento") setActiveData(data);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveData(null);

    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as DragData | undefined;
    const dropData = over.data.current as DropData | undefined;

    if (!dragData || dragData.type !== "documento") return;
    if (!dropData || dropData.type !== "badge") return;

    // Solo permitir drop si el plantillaId coincide
    if (dragData.plantillaId !== dropData.plantillaId) {
      toast.error("Documento incorrecto", {
        description: `"${dragData.nombreDocumento}" no corresponde a esta columna.`,
      });
      return;
    }

    // Optimistic feedback inmediato
    const toastId = toast.loading(`Registrando entrega de "${dragData.nombreDocumento}"…`);

    const result = await actualizarEstadoDocumento({
      inscripcionId: dropData.inscripcionId,
      plantillaId: dropData.plantillaId,
      estado: "entregado",
    });

    if (result.success) {
      toast.success("Documento entregado", {
        id: toastId,
        description: result.mensaje,
      });
    } else {
      toast.error("Error al registrar", {
        id: toastId,
        description: result.error,
      });
    }
  }, []);

  return (
    <DndActiveContext.Provider
      value={{ isDragging: !!activeData, activeName: activeData?.nombreDocumento ?? null }}
    >
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}

        {/* Overlay: fantasma visual durante el arrastre */}
        <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
          {activeData ? (
            <div className="flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-3 py-2 shadow-lg shadow-blue-100/60 ring-1 ring-blue-200">
              <FileText className="size-4 shrink-0 text-blue-600" />
              <span className="max-w-45 truncate text-xs font-medium text-blue-700">
                {activeData.nombreDocumento}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DndActiveContext.Provider>
  );
}