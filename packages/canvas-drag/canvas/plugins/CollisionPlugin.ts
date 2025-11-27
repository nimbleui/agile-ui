import { Plugin, PluginContext, CanvasElement } from "../types";
import { getCorners, doPolygonsIntersect } from "../utils/math";

export const CollisionPlugin: Plugin = {
  name: "CollisionPlugin",

  onInit: (context: PluginContext) => {
    context.api.getCollisions = (element: CanvasElement): CanvasElement[] => {
      const { state } = context;
      const corners = getCorners(element);

      return state.elements.filter((other) => {
        if (other.id === element.id) return false;
        const otherCorners = getCorners(other);
        return doPolygonsIntersect(corners, otherCorners);
      });
    };
  },
};
