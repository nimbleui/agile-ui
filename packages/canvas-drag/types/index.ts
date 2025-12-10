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
  /** 更新元素信息 */
  UPDATE_ELEMENT: Record<string, Partial<RectInfo>>;
  /** 更新选择元素ID */
  SELECT_ELEMENT_IDS: string[];
  /** 更新选择元素的大小 */
  SELECT_BOX: RectInfo | null;
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
  /** 结束位置X轴 */
  endX: number;
  /** 结束位置Y轴 */
  endY: number;
}

export interface PluginContext {
  /** 选中的元素id */
  selectIds: string[];
  /** 选中的元素 */
  selected: Record<string, ElementType>;
  /** 按下的元素 */
  hoveredId: string | null;
  /** 当前操作类型 */
  activeTool: string;
  /** 当前元素的位置信息 */
  rect: RectInfo;
  /** 容器元素的位置信息 */
  containerRect: RectInfo;
  /** 鼠标信息 */
  mouse: MouseInfo;
  /** 是否移动 */
  isMove: boolean;
  /** 元素列表 */
  elements: ElementType[];
  /** 是否多选 */
  multiSelect: boolean;
  /** 更新值, callback：更新完成在执行 */
  dispatch: <K extends keyof CanvasAction>(
    type: K,
    payload: CanvasAction[K],
    callback?: (data: Omit<PluginContext, "dispatch">) => void,
  ) => void;
}

export interface MathTypes {
  /** 角度转弧度 */
  degreesToRadians: (deg: number) => number;
  /** 弧度转角度 */
  radiansToDegrees: (deg: number) => number;
  /** 旋转点 */
  rotatePoint: (point: Point, center: Point, angleDegrees: number) => Point;
  /** 获取元素的中心点 */
  getCenter: (el: RectInfo) => Point;
  /** 获取元素的四个角点 */
  getCorners: (el: RectInfo) => Point[];
  /** 获取选择的位置信息 */
  getSelectionBounds: (ids: string[], selected: Record<string, RectInfo>) => RectInfo | null;
  /** 获取元素的信息 */
  getBoundingBox: (el: RectInfo) => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
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
  selectBox: (data: RectInfo | null) => void;
  selectBounds: (data: RectInfo | null) => void;
  custom: (type: string, data: any) => void;
};
