import { Plugin, RectInfo } from "../types";

/** 旋转插件 */
export function rotatePlugin(): Plugin {
  const downData = {
    angle: 0,
    centerX: 0,
    centerY: 0,
  };
  return {
    name: "rotatePlugin",
    before: ({ activeTool }) => activeTool === "rotate",
    down({ selected, selectIds, containerRect, mouse }, maths) {
      const { startX, startY } = mouse;
      const { left, top } = containerRect;

      const bounds = maths.getSelectionBounds(selectIds, selected);
      if (!bounds) return;
      const center = maths.getCenter(bounds);
      downData.centerY = center.top;
      downData.centerX = center.left;
      downData.angle = Math.atan2(startY - (center.top + top), startX - (center.left + left));
    },
    move({ mouse, containerRect, forEach, dispatch }) {
      const { moveX, moveY } = mouse;
      const { left, top } = containerRect;

      const angle = Math.atan2(moveY - downData.centerY - top, moveX - downData.centerX - left);
      const angleDiff = (angle - downData.angle) * (180 / Math.PI);

      const data: Record<string, Partial<RectInfo>> = {};
      forEach(({ el }) => {
        data[el.id] = { angle: (el.angle || 0) + angleDiff };
      }, true);

      dispatch("UPDATE_ELEMENT", data);
    },
  };
}
