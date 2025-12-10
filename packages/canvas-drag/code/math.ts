import { Point, RectInfo } from "../types";

export const degreesToRadians = (deg: number): number => (deg * Math.PI) / 180;
export const radiansToDegrees = (rad: number): number => (rad * 180) / Math.PI;

/** 获取点旋转后的位置 */
export const rotatePoint = (point: Point, center: Point, angleDegrees: number): Point => {
  const rad = degreesToRadians(angleDegrees);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const { left, top } = center;
  const dx = point.left - left;
  const dy = point.top - top;

  return {
    top: top + (dx * sin + dy * cos),
    left: left + (dx * cos - dy * sin),
  };
};

/** 获取中心点 */
export const getCenter = (el: RectInfo): Point => {
  return {
    top: el.top + el.height / 2,
    left: el.left + el.width / 2,
  };
};

/** 获取元素四个点的位置, 顺序：tl tr br bl */
export function getCorners(el: RectInfo) {
  const center = getCenter(el);
  const { left, top, width, height, angle = 0 } = el;

  const tl = { left, top };
  const tr = { left: left + width, top };
  const br = { left: left + width, top: top + height };
  const bl = { left, top: top + height };

  if (!angle) return [tl, tr, br, bl];

  return [
    rotatePoint(tl, center, angle),
    rotatePoint(tr, center, angle),
    rotatePoint(br, center, angle),
    rotatePoint(bl, center, angle),
  ];
}

/** 获取元素的信息 */
export function getBoundingBox(el: RectInfo) {
  const corners = getCorners(el);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  corners.forEach((p) => {
    minX = Math.min(minX, p.left);
    minY = Math.min(minY, p.top);
    maxX = Math.max(maxX, p.left);
    maxY = Math.max(maxY, p.top);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: el.left + el.width / 2,
    centerY: el.top + el.height / 2,
  };
}

/** 获取选择的位置信息 */
export function getSelectionBounds(ids: string[], selected: Record<string, RectInfo>) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  if (!ids.length) return null;
  if (ids.length == 1) return selected[ids[0]];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const el = selected[id];
    const corners = getCorners(el);

    for (let j = 0; j < corners.length; j++) {
      const p = corners[j];
      minX = Math.min(minX, p.left);
      minY = Math.min(minY, p.top);
      maxX = Math.max(maxX, p.left);
      maxY = Math.max(maxY, p.top);
    }
  }

  return { left: minX, top: minY, width: maxX - minX, height: maxY - minY, angle: 0 };
}

export default {
  degreesToRadians,
  radiansToDegrees,
  rotatePoint,
  getCenter,
  getCorners,
  getBoundingBox,
  getSelectionBounds,
};
