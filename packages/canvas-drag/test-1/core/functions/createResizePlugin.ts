import { CanvasPlugin } from "./types";
import { CanvasElement, Point, HandleType } from "../../types";
import { getCenter, rotatePoint } from "../../utils/geometry";

export const createResizePlugin = (): CanvasPlugin => {
  return (core) => {
    let isResizing = false;
    let startPoint: Point = { x: 0, y: 0 };
    let startElement: CanvasElement | null = null;
    let handleType: HandleType | null = null;

    const onInputDown = (payload: { point: Point; targetId?: string; handle?: HandleType }) => {
      if (payload.handle && payload.handle !== "rotate") {
        const selected = core.getSelectedElements();
        if (selected.length === 1) {
          isResizing = true;
          startPoint = { ...payload.point };
          startElement = { ...selected[0] };
          handleType = payload.handle;
        }
      }
    };

    const onInputMove = (point: Point) => {
      if (!isResizing || !startElement || !handleType) return;

      const el = startElement;
      const center = getCenter(el);
      const currentPos = rotatePoint(point, center, -el.rotation);
      const startPos = rotatePoint(startPoint, center, -el.rotation);

      const dx = currentPos.x - startPos.x;
      const dy = currentPos.y - startPos.y;

      let newX = el.x;
      let newY = el.y;
      let newWidth = el.width;
      let newHeight = el.height;

      const handle = handleType;

      if (handle.includes("e")) newWidth += dx;
      if (handle.includes("w")) {
        newX += dx;
        newWidth -= dx;
      }
      if (handle.includes("s")) newHeight += dy;
      if (handle.includes("n")) {
        newY += dy;
        newHeight -= dy;
      }

      if (newWidth < 10) newWidth = 10;
      if (newHeight < 10) newHeight = 10;

      const newCenter = {
        x: newX + newWidth / 2,
        y: newY + newHeight / 2,
      };

      const rotatedCenter = rotatePoint(newCenter, center, el.rotation);

      const updates = {
        x: rotatedCenter.x - newWidth / 2,
        y: rotatedCenter.y - newHeight / 2,
        width: newWidth,
        height: newHeight,
      };

      const transformPayload = { updates, element: startElement };
      core.eventBus.emit("transform:resizing", transformPayload);

      core.updateElement(startElement.id, transformPayload.updates);
    };

    const onInputUp = () => {
      if (isResizing) {
        isResizing = false;
        startElement = null;
        handleType = null;
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
