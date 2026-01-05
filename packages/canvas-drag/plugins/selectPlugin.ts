import { Plugin, RectInfo } from "../types";

let boxRect: RectInfo | null;
/** 选择插件 */
export function selectPlugin(): Plugin {
  return {
    name: "sizePlugin",
    enforce: "pre",
    down({ hoveredId, selectIds, multiSelect, dispatch, activeTool }) {
      // 点击画布空白区域，取消选择
      if (activeTool == "canvas") {
        return dispatch("SELECT_ELEMENT_IDS", []);
      }
      // 如果拖拽并且没有id说明是操作选择的div
      if (!hoveredId) {
        return dispatch("SELECT_ELEMENT_IDS", selectIds);
      }
      let ids: string[];
      if (multiSelect) {
        ids = selectIds.includes(hoveredId) ? selectIds.filter((id) => id !== hoveredId) : [...selectIds, hoveredId];
      } else {
        ids = [hoveredId];
      }
      dispatch("SELECT_ELEMENT_IDS", ids);
    },
    move({ mouse, activeTool, containerRect, multiSelect, zoom, dispatch }) {
      if (activeTool != "canvas" || multiSelect) return;
      const { left, top } = containerRect;
      const { disX, disY, startX, startY } = mouse;

      const x = startX - left / zoom + (disX < 0 ? disX : 0);
      const y = startY - top / zoom + (disY < 0 ? disY : 0);

      boxRect = { left: x, top: y, width: Math.abs(disX), height: Math.abs(disY) };
      dispatch("SELECT_BOX", boxRect);
    },
    up({ activeTool, forEach, dispatch }, maths) {
      if (activeTool != "canvas" || !boxRect) return;

      const ids: string[] = [];
      const { left, top, width, height } = boxRect;
      forEach(({ moveEl }) => {
        const box = maths.getBoundingBox(moveEl);
        if (left < box.minX && top < box.minY && left + width > box.maxX && top + height > box.maxY) {
          ids.push(moveEl.id);
        }
      });

      boxRect = null;
      dispatch("SELECT_BOX", boxRect);
      dispatch("SELECT_ELEMENT_IDS", ids);
    },
  };
}
