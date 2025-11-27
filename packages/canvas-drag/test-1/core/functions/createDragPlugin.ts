import { CanvasPlugin } from "./types";
import { CanvasElement, Point } from "../../types";

export const createDragPlugin = (): CanvasPlugin => {
  return (core) => {
    let isDragging = false;
    let startPoint: Point = { x: 0, y: 0 };
    let startElement: CanvasElement | null = null;

    const onInputDown = (payload: { point: Point; targetId?: string; handle?: string; shiftKey?: boolean }) => {
      if (payload.targetId && !payload.handle) {
        const el = core.getElement(payload.targetId);
        if (el) {
          // Handle selection logic here or assume core handles it?
          // Core handles selection in handleMouseDown before emitting input:down usually,
          // but if we want full decoupling, selection should be a plugin too?
          // For now, let's assume core handles selection or we check selection.

          // Check if this element is selected
          const selected = core.getSelectedElements();
          if (selected.length === 1 && selected[0].id === payload.targetId) {
            isDragging = true;
            startPoint = { ...payload.point };
            startElement = { ...el };
          }
        }
      }
    };

    const onInputMove = (point: Point) => {
      if (!isDragging || !startElement) return;

      const dx = point.x - startPoint.x;
      const dy = point.y - startPoint.y;

      const updates = {
        x: startElement.x + dx,
        y: startElement.y + dy,
      };

      // Emit event for other plugins (snap, collision) to modify updates
      const transformPayload = { updates, element: startElement };
      core.eventBus.emit("transform:dragging", transformPayload);

      core.updateElement(startElement.id, transformPayload.updates);
    };

    const onInputUp = () => {
      if (isDragging) {
        isDragging = false;
        startElement = null;
        core.eventBus.emit("transform:end");
      }
    };

    core.eventBus.on("input:down", onInputDown);
    core.eventBus.on("input:move", onInputMove);
    core.eventBus.on("input:up", onInputUp);

    return () => {
      core.eventBus.off("input:down", onInputDown);
      core.eventBus.off("input:move", onInputMove);
      core.eventBus.off("input:up", onInputUp);
    };
  };
};
