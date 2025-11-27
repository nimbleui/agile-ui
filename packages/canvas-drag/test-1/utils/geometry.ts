import { Point, Rect } from "../types";

// 角度转弧度
export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
// 弧度转角度
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

// 计算两点之间的距离
export const getDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// 计算点相对于中心的角度
export const getAngle = (center: Point, p: Point): number => {
  return radToDeg(Math.atan2(p.y - center.y, p.x - center.x));
};

// 绕中心点旋转一个点
export const rotatePoint = (point: Point, center: Point, angle: number): Point => {
  const rad = degToRad(angle);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
};

// 获取矩形的中心点
export const getCenter = (rect: Rect): Point => {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
};

// 获取旋转后矩形的四个角坐标
export const getRotatedCorners = (rect: Rect): Point[] => {
  const center = getCenter(rect);
  const corners = [
    { x: rect.x, y: rect.y }, // 左上
    { x: rect.x + rect.width, y: rect.y }, // 右上
    { x: rect.x + rect.width, y: rect.y + rect.height }, // 右下
    { x: rect.x, y: rect.y + rect.height }, // 左下
  ];

  if (rect.rotation === 0) return corners;

  return corners.map((p) => rotatePoint(p, center, rect.rotation));
};

// 获取旋转矩形的未旋转包围盒（用于碰撞检测的近似计算）
export const getBoundingBox = (rect: Rect): Rect => {
  if (rect.rotation === 0) return rect;

  const rotatedCorners = getRotatedCorners(rect);

  const minX = Math.min(...rotatedCorners.map((p) => p.x));
  const maxX = Math.max(...rotatedCorners.map((p) => p.x));
  const minY = Math.min(...rotatedCorners.map((p) => p.y));
  const maxY = Math.max(...rotatedCorners.map((p) => p.y));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    rotation: 0,
  };
};

// 检查两个矩形是否相交（AABB包围盒检测）
export const checkCollision = (rect1: Rect, rect2: Rect): boolean => {
  const box1 = getBoundingBox(rect1);
  const box2 = getBoundingBox(rect2);

  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
};

// 将角度标准化到 0-360 范围
export const normalizeAngle = (angle: number): number => {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
};
