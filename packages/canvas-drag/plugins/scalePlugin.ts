import { Plugin, RectInfo } from "../types";

/** 缩放插件 */
export const scalePlugin: Plugin = {
  name: "scalePlugin",
  before: ({ activeTool }) => activeTool === "scale",
  move({ mouse, dispatch, selected, selectIds, activeToolType, containerRect }, maths) {
    const { moveX, moveY, startX, startY } = mouse;
    const { left, top } = containerRect;

    const start = { left: startX - left, top: startY - top };
    const move = { left: moveX - left, top: moveY - top };

    const data: Record<string, Partial<RectInfo>> = {};
    for (let i = 0; i < selectIds.length; i++) {
      const id = selectIds[i];
      const el = selected[id];
      const { angle = 0 } = el;
      const center = maths.getCenter(el);

      // 将当前鼠标位置和起始位置旋转回未旋转的坐标系中计算
      const startPos = maths.rotatePoint(start, center, -angle);
      const currentPos = maths.rotatePoint(move, center, -angle);

      const dx = currentPos.left - startPos.left;
      const dy = currentPos.top - startPos.top;

      let newY = el.top;
      let newX = el.left;
      let newWidth = el.width;
      let newHeight = el.height;

      // 根据手柄类型调整尺寸和位置
      if (activeToolType?.includes("e")) newWidth += dx;
      if (activeToolType?.includes("w")) {
        newX += dx;
        newWidth -= dx;
      }

      if (activeToolType?.includes("s")) newHeight += dy;
      if (activeToolType?.includes("n")) {
        newY += dy;
        newHeight -= dy;
      }

      // 重新计算缩放后的中心点（未旋转坐标系）
      const newCenter = {
        left: newX + newWidth / 2,
        top: newY + newHeight / 2,
      };
      // 将新中心点旋转回原始旋转角度，以找到实际的 x/y
      const rotatedCenter = maths.rotatePoint(newCenter, center, angle);

      data[id] = {
        width: newWidth,
        height: newHeight,
        top: rotatedCenter.top - newHeight / 2,
        left: rotatedCenter.left - newWidth / 2,
      };
    }

    dispatch("UPDATE_ELEMENT", data);
  },
};
