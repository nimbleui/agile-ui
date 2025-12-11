import { Plugin, RectInfo } from "../types";

export const dragPlugin: Plugin = {
  name: "dragPlugin",
  before: ({ activeTool }) => activeTool === "drag",
  move({ mouse, dispatch, selected, selectIds }) {
    const { disY, disX } = mouse;
    const data: Record<string, Partial<RectInfo>> = {};
    for (let i = 0; i < selectIds.length; i++) {
      const id = selectIds[i];
      const el = selected[id];
      data[id] = { left: parseInt(`${el.left}`) + disX, top: parseInt(`${el.top}`) + disY };
    }
    dispatch("UPDATE_ELEMENT", data);
  },
};
