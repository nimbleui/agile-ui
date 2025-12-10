import { Plugin, RectInfo } from "../types";

export const dragPlugin: Plugin = {
  name: "sizePlugin",
  move({ mouse, dispatch, selected, selectIds, activeTool }, maths) {
    if (activeTool !== "size") return;

    const { disY, disX } = mouse;

    const data: Record<string, Partial<RectInfo>> = {};
    for (let i = 0; i < selectIds.length; i++) {
      const id = selectIds[i];
      const el = selected[id];
      maths.getBoundingBox(el);
    }
    dispatch("UPDATE_ELEMENT", data);
  },
};
