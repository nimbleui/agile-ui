import { Plugin, Point } from "../types";

const doPolygonsIntersect = (a: Point[], b: Point[]): boolean => {
  const polygons = [a, b];
  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    for (let j = 0; j < polygon.length; j++) {
      const p1 = polygon[j];
      const p2 = polygon[(j + 1) % polygon.length];

      const normal = { x: -(p2.top - p1.top), y: p2.left - p1.left };

      let minA = Infinity,
        maxA = -Infinity;
      for (const p of a) {
        const projected = normal.x * p.left + normal.y * p.top;
        if (projected < minA) minA = projected;
        if (projected > maxA) maxA = projected;
      }

      let minB = Infinity,
        maxB = -Infinity;
      for (const p of b) {
        const projected = normal.x * p.left + normal.y * p.top;
        if (projected < minB) minB = projected;
        if (projected > maxB) maxB = projected;
      }

      if (maxA < minB || maxB < minA) return false;
    }
  }
  return true;
};

/**  碰撞检测插件 */
export function collisionPlugin(): Plugin {
  return {
    name: "collisionPlugin",
    enforce: "post",
    move({ selectBound, mouse, forEach, dispatch }, maths) {
      if (!selectBound) return;
      const corners = maths.getCorners({
        ...selectBound,
        left: selectBound.left + mouse.disX,
        top: selectBound.top + mouse.disY,
      });
      const ids: string[] = [];

      forEach(({ moveEl }) => {
        const otherCorners = maths.getCorners(moveEl);
        const checked = doPolygonsIntersect(corners, otherCorners);
        if (checked) ids.push(moveEl.id);
      }, "notSelected");
      dispatch("UPDATE_COLLISION", ids);
    },
  };
}
