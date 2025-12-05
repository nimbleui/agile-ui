export interface ElementType {
  id: string;
  width: number | string;
  height: number | string;
  top: number | string;
  left: number | string;
  [key: string]: any;
}

export type CanvasAction =
  | { type: "UPDATE_ELEMENT"; payload: Partial<RectInfo> & { id: string } }
  // 追加新增的x轴和y轴的位置
  | { type: "APPEND_SITE"; payload: { disX: number; disY: number } };

export interface RectInfo {
  /** 距离顶部的距离 */
  top: number;
  /** 距离左部的距离 */
  left: number;
  /** 元素的宽度 */
  width: number;
  /** 元素的高度 */
  height: number;
}

export interface MouseInfo {
  /** 鼠标按下的位置X轴 */
  startX: number;
  /** 鼠标按下的位置Y轴 */
  startY: number;
  /** 鼠标移动的位置X轴 */
  moveX: number;
  /** 鼠标移动的位置Y轴 */
  moveY: number;
  /** 鼠标移动X轴的位置 */
  disX: number;
  /** 鼠标移动Y轴的位置 */
  disY: number;
}

export interface PluginContext {
  /** 选中的元素id */
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
  dispatch: (action: CanvasAction) => void;
}

export interface Plugin {
  name: string;
  init?: (context: PluginContext) => void;
  render?: (context: PluginContext) => void;
  down?: (context: PluginContext) => void;
  move?: (context: PluginContext) => void;
  up?: (context: PluginContext) => void;
  keyDown?: (context: PluginContext) => void;
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
