import { Plugin, GuidesList, ElementType } from "../types";

/**  辅助线插件 */
export function smartGuidesPlugin(): Plugin {
  return {
    name: "smartGuidesPlugin",
    enforce: "post",
    move({ selectIds, forEach, dispatch }, maths) {
      const selected: { [key: string]: ElementType } = {};
      forEach(({ moveEl }) => (selected[moveEl.id] = moveEl), true);
      const bounds = maths.getSelectionBounds(selectIds, selected);
      if (!bounds) return;

      const { left, width, top, height } = bounds;
      const yPoints = [top, top + height / 2, top + height];
      const xPoints = [left, left + width / 2, left + width];

      const data: GuidesList = [];
      forEach(({ moveEl, selected }) => {
        if (selected) return;
        const rect = maths.getBoundingBox(moveEl);
        const targetXPoints = [rect.minX, rect.centerX, rect.maxX];
        const targetYPoints = [rect.minY, rect.centerY, rect.maxY];

        for (let i = 0; i < xPoints.length; i++) {
          const item = xPoints[i];
          for (let j = 0; j < targetXPoints.length; j++) {
            const val = targetXPoints[j];
            if (item == val) {
              data[0] = { type: "vertical", position: val };
            }
          }
        }

        for (let i = 0; i < yPoints.length; i++) {
          const item = yPoints[i];
          for (let j = 0; j < targetYPoints.length; j++) {
            const val = targetYPoints[j];
            if (item == val) {
              data[1] = { type: "horizontal", position: val };
            }
          }
        }
      });
      dispatch(
        "UPDATE_GUIDES",
        data.filter((el) => el),
      );
    },
    up({ dispatch }) {
      dispatch("UPDATE_GUIDES", []);
    },
  };
}
