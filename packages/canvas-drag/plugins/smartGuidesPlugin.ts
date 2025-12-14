import { Plugin } from "../types";

/**  辅助线插件 */
export const smartGuidesPlugin: Plugin = {
  name: "smartGuidesPlugin",
  enforce: "post",
  move({ elements, selectIds, selected }, maths) {
    const bounds = maths.getSelectionBounds(selectIds, selected);
    if (!bounds) return;

    const { left, width, top, height } = bounds;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (selected[el.id]) continue;
    }
  },
};
