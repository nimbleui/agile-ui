import { Point, CanvasElement } from "../types";

export const degreesToRadians = (deg: number): number => (deg * Math.PI) / 180;
export const radiansToDegrees = (rad: number): number => (rad * 180) / Math.PI;

export const rotatePoint = (point: Point, center: Point, angleDegrees: number): Point => {
  const rad = degreesToRadians(angleDegrees);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
};

export const getCenter = (element: CanvasElement): Point => {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  };
};

// Get the 4 corners of the rotated element
export const getCorners = (element: CanvasElement): Point[] => {
  const center = getCenter(element);
  const { x, y, width, height, rotation } = element;

  const tl = { x, y };
  const tr = { x: x + width, y };
  const br = { x: x + width, y: y + height };
  const bl = { x, y: y + height };

  if (rotation === 0) return [tl, tr, br, bl];

  return [
    rotatePoint(tl, center, rotation),
    rotatePoint(tr, center, rotation),
    rotatePoint(br, center, rotation),
    rotatePoint(bl, center, rotation),
  ];
};

export const isPointInRect = (point: Point, element: CanvasElement): boolean => {
  // Rotate point back to axis-aligned space relative to element center
  const center = getCenter(element);
  const rotatedPoint = rotatePoint(point, center, -element.rotation);

  return (
    rotatedPoint.x >= element.x &&
    rotatedPoint.x <= element.x + element.width &&
    rotatedPoint.y >= element.y &&
    rotatedPoint.y <= element.y + element.height
  );
};

export const getDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const screenToCanvas = (screenPoint: Point, canvasOffset: Point, scale: number): Point => {
  return {
    x: (screenPoint.x - canvasOffset.x) / scale,
    y: (screenPoint.y - canvasOffset.y) / scale,
  };
};

// SAT Collision Detection
export const doPolygonsIntersect = (a: Point[], b: Point[]): boolean => {
  const polygons = [a, b];
  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    for (let j = 0; j < polygon.length; j++) {
      const p1 = polygon[j];
      const p2 = polygon[(j + 1) % polygon.length];

      const normal = { x: -(p2.y - p1.y), y: p2.x - p1.x };

      let minA = Infinity,
        maxA = -Infinity;
      for (const p of a) {
        const projected = normal.x * p.x + normal.y * p.y;
        if (projected < minA) minA = projected;
        if (projected > maxA) maxA = projected;
      }

      let minB = Infinity,
        maxB = -Infinity;
      for (const p of b) {
        const projected = normal.x * p.x + normal.y * p.y;
        if (projected < minB) minB = projected;
        if (projected > maxB) maxB = projected;
      }

      if (maxA < minB || maxB < minA) return false;
    }
  }
  return true;
};
