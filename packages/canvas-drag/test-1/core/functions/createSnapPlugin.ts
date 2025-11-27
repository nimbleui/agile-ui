import { CanvasPlugin } from "./types";
import { CanvasElement } from "../../types";

export const createSnapPlugin = (): CanvasPlugin => {
  return (core) => {
    const applyGridSnap = (updates: Partial<CanvasElement>): Partial<CanvasElement> => {
      const gridSize = core.config.gridSize || 10;
      const snapped = { ...updates };

      if (snapped.x !== undefined) snapped.x = Math.round(snapped.x / gridSize) * gridSize;
      if (snapped.y !== undefined) snapped.y = Math.round(snapped.y / gridSize) * gridSize;
      if (snapped.width !== undefined) snapped.width = Math.round(snapped.width / gridSize) * gridSize;
      if (snapped.height !== undefined) snapped.height = Math.round(snapped.height / gridSize) * gridSize;

      return snapped;
    };

    const handleTransform = (payload: { updates: Partial<CanvasElement> }) => {
      if (core.config.snapToGrid) {
        payload.updates = applyGridSnap(payload.updates);
      }
    };

    core.eventBus.on("transform:dragging", handleTransform);
    core.eventBus.on("transform:resizing", handleTransform);

    return () => {
      core.eventBus.off("transform:dragging", handleTransform);
      core.eventBus.off("transform:resizing", handleTransform);
    };
  };
};
