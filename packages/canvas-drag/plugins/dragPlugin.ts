import { Plugin, RectInfo } from "../types";

/** 拖拽插件 */
export function dragPlugin(limit?: boolean): Plugin {
  return {
    name: "dragPlugin",
    enforce: "pre",
    before: ({ activeTool }) => activeTool === "drag",
    move({ mouse, selectBound, containerRect, zoom, dispatch, forEach }) {
      let { disY, disX } = mouse;
      const data: Record<string, Partial<RectInfo>> = {};

      if (limit) {
        const minY = selectBound?.top || 0;
        const minX = selectBound?.left || 0;
        const maxX = containerRect.width / zoom - minX - (selectBound?.width || 0);
        const maxY = containerRect.height / zoom - minY - (selectBound?.height || 0);

        if (disX < 0 && Math.abs(disX) > minX) disX = -minX;
        if (disX > 0 && disX > maxX) disX = maxX;

        if (disY < 0 && Math.abs(disY) > minY) disY = -minY;
        if (disY > 0 && disY > maxY) disY = maxY;
      }

      forEach(({ el }) => {
        data[el.id] = { left: parseInt(`${el.left}`) + disX, top: parseInt(`${el.top}`) + disY };
      }, "selected");

      dispatch("UPDATE_ELEMENT", data);
    },
  };
}
