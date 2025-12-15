import { Plugin } from "../types";

/**  碰撞检测插件 */
export const collisionDetectionPlugin: Plugin = {
  name: "collisionDetectionPlugin",
  enforce: "post",
  move({ selectIds, selected }, maths) {
    const bounds = maths.getSelectionBounds(selectIds, selected);
    if (!bounds) return;
  },
};
