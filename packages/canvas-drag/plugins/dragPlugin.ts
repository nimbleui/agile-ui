import { Plugin, RectInfo } from "../types";

/** 拖拽插件 */
export function dragPlugin(): Plugin {
  return {
    name: "dragPlugin",
    enforce: "pre",
    before: ({ activeTool }) => activeTool === "drag",
    move({ mouse, dispatch, forEach }) {
      const { disY, disX } = mouse;
      const data: Record<string, Partial<RectInfo>> = {};

      forEach(({ el }) => {
        data[el.id] = { left: parseInt(`${el.left}`) + disX, top: parseInt(`${el.top}`) + disY };
      }, true);

      dispatch("UPDATE_ELEMENT", data);
    },
  };
}
