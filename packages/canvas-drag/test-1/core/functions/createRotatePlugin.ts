import { CanvasPlugin } from "./types";
import { CanvasElement, Point } from "../../types";
import { getCenter, getAngle } from "../../utils/geometry";

export const createRotatePlugin = (): CanvasPlugin => {
  return (core) => {
    let isRotating = false;
    let startPoint: Point = { x: 0, y: 0 };
    let startElement: CanvasElement | null = null;

    const onInputDown = (payload: { point: Point; targetId?: string; handle?: string }) => {
      if (payload.handle === "rotate") {
        const selected = core.getSelectedElements();
        if (selected.length === 1) {
          isRotating = true;
          startPoint = { ...payload.point };
          startElement = { ...selected[0] };
        }
      }
    };

    const onInputMove = (point: Point) => {
      if (!isRotating || !startElement) return;

      const center = getCenter(startElement);
      const startAngle = getAngle(center, startPoint);
      const currentAngle = getAngle(center, point);
      const angleDiff = currentAngle - startAngle;

      const updates = {
        rotation: (startElement.rotation + angleDiff) % 360,
      };

      const transformPayload = { updates, element: startElement };
      core.eventBus.emit("transform:rotating", transformPayload);

      core.updateElement(startElement.id, transformPayload.updates);
    };

    const onInputUp = () => {
      if (isRotating) {
        isRotating = false;
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
