import { CanvasPlugin } from "./Plugin";
import { CanvasCore } from "../CanvasCore";
import { CanvasElement } from "../../types";
import { checkCollision } from "../../utils/geometry";

export class CollisionPlugin implements CanvasPlugin {
  name = "CollisionPlugin";
  private core: CanvasCore | null = null;

  init(core: CanvasCore) {
    this.core = core;
    this.core.eventBus.on("transform:dragging", this.handleTransform.bind(this));
    this.core.eventBus.on("transform:resizing", this.handleTransform.bind(this));
    this.core.eventBus.on("transform:rotating", this.handleTransform.bind(this));
  }

  destroy() {
    if (this.core) {
      this.core.eventBus.off("transform:dragging", this.handleTransform.bind(this));
      this.core.eventBus.off("transform:resizing", this.handleTransform.bind(this));
      this.core.eventBus.off("transform:rotating", this.handleTransform.bind(this));
    }
  }

  private handleTransform(payload: { updates: Partial<CanvasElement>; element: CanvasElement }) {
    if (!this.core) return;

    const targetId = payload.element.id;
    const potentialNewState = { ...payload.element, ...payload.updates };

    const hasCollision = this.core.elements.some((el) => {
      if (el.id === targetId) return false;
      return checkCollision(potentialNewState, el);
    });

    this.core.eventBus.emit("collision", hasCollision);
  }
}
