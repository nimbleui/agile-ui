import { CanvasPlugin } from "./Plugin";
import { CanvasCore } from "../CanvasCore";
import { CanvasElement } from "../../types";

export class SnapPlugin implements CanvasPlugin {
  name = "SnapPlugin";
  private core: CanvasCore | null = null;

  init(core: CanvasCore) {
    this.core = core;
    this.core.eventBus.on("transform:dragging", this.handleDrag.bind(this));
    this.core.eventBus.on("transform:resizing", this.handleResize.bind(this));
  }

  destroy() {
    if (this.core) {
      this.core.eventBus.off("transform:dragging", this.handleDrag.bind(this));
      this.core.eventBus.off("transform:resizing", this.handleResize.bind(this));
    }
  }

  private handleDrag(payload: { updates: Partial<CanvasElement> }) {
    if (!this.core) return;
    if (this.core.config.snapToGrid) {
      payload.updates = this.applyGridSnap(payload.updates);
    }
    if (this.core.config.showGuides) {
      payload.updates = this.core.applySmartGuides(payload.updates); // We need to move applySmartGuides logic here or keep it in core and call it?
      // Better to move logic here.
    }
  }

  private handleResize(payload: { updates: Partial<CanvasElement> }) {
    if (!this.core) return;
    if (this.core.config.snapToGrid) {
      payload.updates = this.applyGridSnap(payload.updates);
    }
  }

  private applyGridSnap(updates: Partial<CanvasElement>): Partial<CanvasElement> {
    if (!this.core) return updates;
    const gridSize = this.core.config.gridSize || 10;
    const snapped = { ...updates };

    if (snapped.x !== undefined) {
      snapped.x = Math.round(snapped.x / gridSize) * gridSize;
    }
    if (snapped.y !== undefined) {
      snapped.y = Math.round(snapped.y / gridSize) * gridSize;
    }
    if (snapped.width !== undefined) {
      snapped.width = Math.round(snapped.width / gridSize) * gridSize;
    }
    if (snapped.height !== undefined) {
      snapped.height = Math.round(snapped.height / gridSize) * gridSize;
    }

    return snapped;
  }
}
