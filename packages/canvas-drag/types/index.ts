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

export interface GuidesType {
  /** 方向 */
  type: "vertical" | "horizontal";
  /** 位置 */
  position: number;
  /** 距离大小 */
  gap: number;
  /** 开始位置 */
  start: number;
  /** 结束位置 */
  end: number;
}

export type GuidesList = GuidesType[];

export type CanvasAction = {
  /** 更新元素信息 */
  UPDATE_ELEMENT: Record<string, Partial<RectInfo>>;
  /** 更新选择元素ID */
  SELECT_ELEMENT_IDS: string[];
  /** 更新选择元素的大小 */
  SELECT_BOX: RectInfo | null;
  /** 更新辅助线 */
  UPDATE_GUIDES: GuidesList;
  /** 更新碰撞 */
  UPDATE_COLLISION: string[];
  /** 更新缩放比例 */
  UPDATE_ZOOM: { zoom: number; y: number; x: number };
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
  /**滚轮Y轴的值 */
  deltaY: number;
  /**滚轮X轴的值 */
  deltaX: number;
}

export interface PluginType<T extends ElementType = ElementType> {
  /** 选中的元素id */
  selectIds: string[];
  /** 选中的元素 */
  selected: Record<string, T>;
  /** 按下的元素 */
  hoveredId: string | null;
  /** 当前操作类型 */
  activeTool: "canvas" | "drag" | "scale" | "rotate" | null;
  /** 当前操作类型值 */
  activeToolType?: string | null;
  /** 当前元素的位置信息 */
  rect: RectInfo;
  /** 容器元素的位置信息 */
  containerRect: RectInfo;
  /** 鼠标信息 */
  mouse: MouseInfo;
  /** 是否移动 */
  isMove: boolean;
  /** 元素列表 */
  elements: T[];
  /** 鼠标按下时选中元素信息 */
  selectBound: RectInfo | null;
  /** 画布缩放比例 */
  zoom: number;
  /** 画布缩放比例时偏移X轴量 */
  translateX: number;
  /** 画布缩放比例时偏移Y轴量 */
  translateY: number;
  /** 按下的键盘key */
  keyCode: string;
}
export type ActiveTool = PluginType["activeTool"];

export interface MathTypes {
  /** 角度转弧度 */
  degreesToRadians: (deg: number) => number;
  /** 弧度转角度 */
  radiansToDegrees: (deg: number) => number;
  /** 旋转后的点坐标 */
  rotatePoint: (point: Point, center: Point, angleDegrees: number) => Point;
  /** 获取元素的中心点 */
  getCenter: (el: RectInfo) => Point;
  /** 获取元素的四个角点, 顺序：tl tr br bl */
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

export type PluginContext = Omit<PluginType, "elements" | "selected"> & {
  /**
   * 循环元素
   * callback 回调函数：
   *  第一个参数：el: 鼠标按下时的元素信息、selected：是否选中、moveEl：鼠标移动时的元素信息
   *  第二参数：循环类型：all：所有  selected：选中  notSelected：没选中，默认是all
   */
  forEach: (
    callback: (data: {
      /** 鼠标按下时的元素信息 */
      el: ElementType;
      /** 是否选中 */
      selected: boolean;
      /** 鼠标移动时的元素信息 */
      moveEl: ElementType;
    }) => void,
    /** 循环类型：all：所有  selected：选中  notSelected：没选中 */
    type?: "all" | "selected" | "notSelected",
  ) => void;
  /**
   * 更新值
   * @param type UPDATE_ELEMENT: 更新元素信息 | SELECT_ELEMENT_IDS: 更新选择元素ID | SELECT_BOX: 更新选择元素的大小 | UPDATE_GUIDES：更新辅助线 | UPDATE_COLLISION：更新碰撞信息
   * @param payload 对应 type 的参数
   * @param callback 更新完成在执行的回调
   */
  dispatch: <K extends keyof CanvasAction>(type: K, payload: CanvasAction[K], callback?: () => void) => void;
};
export interface Plugin {
  /** 插件名称 */
  name: string;
  /** 执行顺序，默认：normal， pre -> normal -> post */
  enforce?: "pre" | "post" | "normal";
  /** 插件初始化时触发 */
  init?: (context: PluginContext) => void;
  /** 鼠标按下时触发 */
  down?: (context: PluginContext, maths: MathTypes) => void;
  /** 鼠标移动时触发 */
  move?: (context: PluginContext, maths: MathTypes) => void;
  /** 鼠标抬起时触发 */
  up?: (context: PluginContext, maths: MathTypes) => void;
  /** 插件生效的条件 */
  before?: (context: PluginContext) => boolean;
  /** 滚轮事件 */
  wheel?: (context: PluginContext, maths: MathTypes) => void;
  /** 配合按键，值是去key值，空格会转成space其他不变，组合：ctrl+a，多种："ctrl+a,alt" */
  keyCode?: string;
}

export interface CanvasDragOptions {
  /** 插件 */
  plugins: Plugin[];
  /** 缩放比例 */
  zoom?: number;
}

export type EventTypes<T extends ElementType = ElementType> = {
  /** 选择的元素 */
  select: (data: string[]) => void;
  /** 元素发生变化 */
  change: (data: T[]) => void;
  selectBox: (data: RectInfo | null) => void;
  selectBounds: (data: RectInfo | null) => void;
  custom: (type: string, data: any) => void;
  /** 辅助线 */
  guides: (data: GuidesList) => void;
  /** 碰撞检查 */
  collision: (data: string[]) => void;
  /** 鼠标按下 */
  down: (e: MouseEvent | TouchEvent) => void;
  /** 鼠标移动 */
  move: (e: MouseEvent | TouchEvent) => void;
  /** 鼠标抬起 */
  up: (e: MouseEvent | TouchEvent) => void;
  /** 拖拽 */
  drag: (data: Record<string, { left: number; top: number }>, ids: string[]) => void;
  /** 放大缩小 */
  scale: (data: Record<string, { width: number; height: number }>, ids: string[]) => void;
  /** 旋转 */
  rotate: (data: Record<string, { angle: number }>, ids: string[]) => void;
  /** 画布缩放比例 */
  zoom: (data: { zoom: number; x: number; y: number }) => void;
};
