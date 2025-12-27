import { GuidesList, Plugin, RectInfo } from "../types";

/** 吸附和辅助线插件 */
export function smartGuidesPlugin(options?: { threshold: number }): Plugin {
  const threshold = options?.threshold || 5;
  return {
    name: "smartGuidesPlugin",
    before: ({ activeTool }) => activeTool === "drag",
    move({ selectBound, mouse, dispatch, forEach }, maths) {
      const { disX, disY } = mouse;
      if (!selectBound) return;

      const minX = selectBound.left;
      const minY = selectBound.top;
      const xPoints = [
        { val: minX, type: "l" },
        { val: minX + selectBound.width / 2, type: "c" },
        { val: minX + selectBound.width, type: "r" },
      ];
      const yPoints = [
        { val: minY, type: "t" },
        { val: minY + selectBound.height / 2, type: "c" },
        { val: minY + selectBound.height, type: "b" },
      ];

      const x = { gap: Infinity, direction: "", position: 0, start: 0, end: 0 };
      const y = { gap: Infinity, direction: "", position: 0, start: 0, end: 0 };

      forEach(({ moveEl }) => {
        const rect = maths.getBoundingBox(moveEl);
        const targetXPoints = [rect.minX, rect.centerX, rect.maxX];
        const targetYPoints = [rect.minY, rect.centerY, rect.maxY];

        for (let i = 0; i < xPoints.length; i++) {
          const item = xPoints[i];
          for (let j = 0; j < targetXPoints.length; j++) {
            const val = targetXPoints[j];
            const diff = val - item.val;
            if (Math.abs(x.gap) > Math.abs(diff)) {
              Object.assign(x, {
                gap: diff,
                direction: item.type,
                position: val,
                start: Math.min(selectBound.left, rect.minX),
                end: Math.max(selectBound.width + selectBound.left, rect.maxX),
              });
            }
          }
        }

        for (let i = 0; i < yPoints.length; i++) {
          const item = yPoints[i];
          for (let j = 0; j < targetYPoints.length; j++) {
            const val = targetYPoints[j];
            const diff = val - item.val;
            if (Math.abs(y.gap) > Math.abs(diff)) {
              Object.assign(y, {
                gap: diff,
                direction: item.type,
                position: val,
                start: Math.min(selectBound.top, rect.minY),
                end: Math.max(selectBound.height + selectBound.top, rect.maxY),
              });
            }
          }
        }
      }, "notSelected");

      const xChecked = Math.abs(x.gap) < threshold;
      const yChecked = Math.abs(y.gap) < threshold;

      if (xChecked || yChecked) {
        const data: Record<string, Partial<RectInfo>> = {};
        forEach(({ el }) => {
          let left = parseInt(`${el.left}`) + disX;
          if (xChecked) left += x.gap;

          let top = parseInt(`${el.top}`) + disY;
          if (yChecked) top += y.gap;

          data[el.id] = { left, top };
        }, "selected");
        dispatch("UPDATE_ELEMENT", data);
      }

      const list: GuidesList = [];
      if (xChecked) list.push({ ...x, type: "vertical" });
      if (yChecked) list.push({ ...y, type: "horizontal" });
      dispatch("UPDATE_GUIDES", list);
    },
    up({ dispatch }) {
      dispatch("UPDATE_GUIDES", []);
    },
  };
}
