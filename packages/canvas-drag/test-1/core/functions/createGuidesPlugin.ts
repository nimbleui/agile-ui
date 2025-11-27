import { CanvasPlugin } from "./types";
import { CanvasElement, SnapGuide } from "../../types";
import { getRotatedCorners, getCenter } from "../../utils/geometry";

export const createGuidesPlugin = (): CanvasPlugin => {
  return (core) => {
    const handleDrag = (payload: { updates: Partial<CanvasElement> }) => {
      if (!core.config.showGuides) return;

      const threshold = core.config.snapThreshold || 5;
      const current = { ...core.getSelectedElements()[0], ...payload.updates };
      const snapped = { ...payload.updates };
      const guides: SnapGuide[] = [];

      const currentCorners = getRotatedCorners(current);
      const currentCenter = getCenter(current);
      const currentPoints = [...currentCorners, currentCenter];

      core.elements.forEach((other) => {
        if (core.getSelectedElements().some((el) => el.id === other.id)) return;

        const otherCorners = getRotatedCorners(other);
        const otherCenter = getCenter(other);
        const otherPoints = [...otherCorners, otherCenter];

        for (const p1 of currentPoints) {
          for (const p2 of otherPoints) {
            if (Math.abs(p1.x - p2.x) < threshold) {
              const deltaX = p2.x - p1.x;
              snapped.x = (snapped.x || current.x) + deltaX;
              guides.push({ type: "vertical", position: p2.x });
            }
            if (Math.abs(p1.y - p2.y) < threshold) {
              const deltaY = p2.y - p1.y;
              snapped.y = (snapped.y || current.y) + deltaY;
              guides.push({ type: "horizontal", position: p2.y });
            }
          }
        }
      });

      const uniqueGuides = guides.filter(
        (g, index, self) =>
          index === self.findIndex((t) => t.type === g.type && Math.abs(t.position - g.position) < 0.1),
      );

      core.activeGuides = uniqueGuides;
      core.eventBus.emit("guides:updated", uniqueGuides);
      payload.updates = snapped;
    };

    const handleEnd = () => {
      core.activeGuides = [];
      core.eventBus.emit("guides:updated", []);
    };

    core.eventBus.on("transform:dragging", handleDrag);
    core.eventBus.on("transform:end", handleEnd);

    return () => {
      core.eventBus.off("transform:dragging", handleDrag);
      core.eventBus.off("transform:end", handleEnd);
    };
  };
};
