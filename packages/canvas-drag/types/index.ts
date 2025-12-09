export interface Point {
  /** 距离顶部的距离 */
  top: number;
  /** 距离左部的距离 */
  left: number;
}

export interface RectInfo extends Point {
  /** 元素的宽度 */
  width: number;
  /** 元素的高度 */
  height: number;
  /** 旋转角度 */
  angle?: number;
}

export interface ElementType extends RectInfo {
  /** 元素唯一标识 */
  id: string;
  [key: string]: any;
}

export type CanvasAction = {
  UPDATE_ELEMENT: Record<string, Partial<RectInfo>>;
  APPEND_SIZE: { x: number; y: number };
};

export interface MouseInfo {
  /** 鼠标按下的位置X轴 */
  startX: number;
  /** 鼠标按下的位置Y轴 */
  startY: number;
  /** 鼠标移动的位置X轴 */
  moveX: number;
  /** 鼠标移动的位置Y轴 */
  moveY: number;
  /** 鼠标移动X轴的距离 */
  disX: number;
  /** 鼠标移动Y轴的距离 */
  disY: number;
}

export interface PluginContext {
  /** 选中的元素id */
  selectIds: string[];
  /** 选中的元素 */
  selected: Record<string, ElementType>;
  /** 当前操作类型 */
  handle: string;
  /** 当前元素的位置信息 */
  rect: RectInfo;
  /** 容器元素的位置信息 */
  containerRect: RectInfo;
  /** 鼠标信息 */
  mouse: MouseInfo;
  /** 是否移动 */
  isMove: boolean;
  /** 更新值 */
  dispatch: <K extends keyof CanvasAction>(type: K, payload: CanvasAction[K]) => void;
}

export interface MathTypes {
  degreesToRadians: (deg: number) => number;
  radiansToDegrees: (deg: number) => number;
  rotatePoint: (point: Point, center: Point, angleDegrees: number) => Point;
  getCenter: (el: RectInfo) => Point;
  getCorners: (el: RectInfo) => Point[];
  getSelectionBounds: (ids: string[], selected: Record<string, RectInfo>) => RectInfo | null;
}

export interface Plugin {
  name: string;
  init?: (context: PluginContext) => void;
  down?: (context: PluginContext, math: MathTypes) => void;
  move?: (context: PluginContext, math: MathTypes) => void;
  up?: (context: PluginContext, math: MathTypes) => void;
  keyDown?: (context: PluginContext, math: MathTypes) => void;
  destroy?: () => void;
  before?: (context: PluginContext) => boolean;
}

export interface CanvasDragOptions {
  /** 插件 */
  plugins: Plugin[];
  /** 元素列表 */
  elements?: ElementType[];
  /** 多选时，按的是那个键 */
  keyCode?: "shiftKey" | "altKey" | "ctrlKey";
}

export type EventTypes = {
  select: (data: RectInfo) => void;
  change: (data: ElementType[]) => void;
};
