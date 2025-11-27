import { CanvasPlugin } from "./Plugin";
import { CanvasCore } from "../CanvasCore";
import { CanvasElement, SnapGuide } from "../../types";
import { getRotatedCorners, getCenter } from "../../utils/geometry";

export class SmartGuidesPlugin implements CanvasPlugin {
  name = "SmartGuidesPlugin";
  private core: CanvasCore | null = null;

  init(core: CanvasCore) {
    this.core = core;
    this.core.eventBus.on("transform:dragging", this.handleDrag.bind(this));
  }

  destroy() {
    if (this.core) {
      this.core.eventBus.off("transform:dragging", this.handleDrag.bind(this));
    }
  }

  private handleDrag(payload: { updates: Partial<CanvasElement> }) {
    if (!this.core || !this.core.config.showGuides) return;
    payload.updates = this.applySmartGuides(payload.updates);
  }

  private applySmartGuides(updates: Partial<CanvasElement>): Partial<CanvasElement> {
    if (!this.core) return updates;
    const threshold = this.core.config.snapThreshold || 5;
    const current = { ...this.core.getSelectedElements()[0], ...updates };
    const snapped = { ...updates };
    const guides: SnapGuide[] = [];

    // Get rotated corners of the current element (potential new position)
    const currentCorners = getRotatedCorners(current);
    const currentCenter = getCenter(current);
    const currentPoints = [...currentCorners, currentCenter];

    // Check against other elements
    this.core.elements.forEach((other) => {
      if (!this.core) return;
      if (this.core.getSelectedElements().some((el) => el.id === other.id)) return;

      // Get rotated corners and center of the target element
      const otherCorners = getRotatedCorners(other);
      const otherCenter = getCenter(other);
      const otherPoints = [...otherCorners, otherCenter];

      // We need to find the best snap match
      // Iterate through all points of the current element
      for (const p1 of currentPoints) {
        // Iterate through all points of the target element
        for (const p2 of otherPoints) {
          // Vertical Snapping (X-axis alignment)
          if (Math.abs(p1.x - p2.x) < threshold) {
            // Calculate delta needed to snap
            const deltaX = p2.x - p1.x;
            snapped.x = (snapped.x || current.x) + deltaX;
            guides.push({ type: "vertical", position: p2.x });
          }

          // Horizontal Snapping (Y-axis alignment)
          if (Math.abs(p1.y - p2.y) < threshold) {
            // Calculate delta needed to snap
            const deltaY = p2.y - p1.y;
            snapped.y = (snapped.y || current.y) + deltaY;
            guides.push({ type: "horizontal", position: p2.y });
          }
        }
      }
    });

    // Remove duplicate guides
    const uniqueGuides = guides.filter(
      (g, index, self) => index === self.findIndex((t) => t.type === g.type && Math.abs(t.position - g.position) < 0.1),
    );

    this.core.activeGuides = uniqueGuides;
    return snapped;
  }
}
