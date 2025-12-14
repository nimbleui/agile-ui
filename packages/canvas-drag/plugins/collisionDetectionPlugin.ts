import { Plugin } from "../types";

/**  碰撞检测插件 */
export const collisionDetectionPlugin: Plugin = {
  name: "collisionDetectionPlugin",
  enforce: "post",
  move({ elements, selectIds, selected }, maths) {
    const bounds = maths.getSelectionBounds(selectIds, selected);
    if (!bounds) return;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (selected[el.id]) continue;
    }
  },
};
