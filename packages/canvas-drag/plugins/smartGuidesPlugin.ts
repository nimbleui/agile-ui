import { Plugin } from "../types";

/**  辅助线插件 */
export const smartGuidesPlugin: Plugin = {
  name: "smartGuidesPlugin",
  enforce: "post",
  move({ selectIds, selected, forEach }, maths) {
    const bounds = maths.getSelectionBounds(selectIds, selected);
    if (!bounds) return;

    const { left, width, top, height } = bounds;
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    forEach(({ moveEl, selected }) => {
      console.log(moveEl);
      console.log(selected);
    });
  },
};
