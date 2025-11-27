import { CanvasPlugin } from "./types";
import { CanvasElement } from "../../types";
import { checkCollision } from "../../utils/geometry";

export const createCollisionPlugin = (): CanvasPlugin => {
  return (core) => {
    const handleTransform = (payload: { updates: Partial<CanvasElement>; element: CanvasElement }) => {
      const targetId = payload.element.id;
      const potentialNewState = { ...payload.element, ...payload.updates };

      const hasCollision = core.elements.some((el) => {
        if (el.id === targetId) return false;
        return checkCollision(potentialNewState, el);
      });

      core.eventBus.emit("collision", hasCollision);
    };

    const handleEnd = () => {
      core.eventBus.emit("collision", false);
    };

    core.eventBus.on("transform:dragging", handleTransform);
    core.eventBus.on("transform:resizing", handleTransform);
    core.eventBus.on("transform:rotating", handleTransform);
    core.eventBus.on("transform:end", handleEnd);

    return () => {
      core.eventBus.off("transform:dragging", handleTransform);
      core.eventBus.off("transform:resizing", handleTransform);
      core.eventBus.off("transform:rotating", handleTransform);
      core.eventBus.off("transform:end", handleEnd);
    };
  };
};
