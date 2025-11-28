export interface DataType {
  /** dragging: 拖拽 resizing：放大缩小 rotating：旋转  */
  type: "dragging" | "resizing" | "rotating";
  /** 存储元素信息 */
  elements: ElementType[];
  /** 画布元素 */
  canvasEl: HTMLElement | null;
}

export type CanvasAction =
  | { type: "UPDATE_ELEMENT"; payload: Partial<HTMLElement> & { id: string } }
  | { type: "ADD_ELEMENT"; payload: HTMLElement }
  | { type: "REMOVE_ELEMENT"; payload: string }
  | { type: "SELECT_ELEMENT"; payload: string | string[] }
  | { type: "SET_HOVER"; payload: string | null };
// | { type: "SET_CANVAS_TRANSFORM"; payload: { scale?: number; offset?: Point } }
// | { type: "SET_TOOL"; payload: CanvasState["activeTool"] }
// | { type: "SET_SNAP_LINES"; payload: SnapLine[] };

export interface PluginContext {
  /** 容器元素 */
  el: HTMLElement;
  /** 其他参数 */
  api: Record<string, any>;
  /** 当前操作类型 */
  handle: string;
  /** 更新值 */
  dispatch: (action: CanvasAction) => void;
}

export interface Plugin {
  name: string;
  init?: (context: PluginContext) => void;
  render?: (context: PluginContext) => void;
  down?: (e: MouseEvent, context: PluginContext) => void;
  move?: (e: MouseEvent, context: PluginContext) => void;
  up?: (e: MouseEvent, context: PluginContext) => void;
  keyDown?: (e: KeyboardEvent, context: PluginContext) => void;
  destroy?: () => void;
  before?: (context: PluginContext) => boolean;
}

export interface CanvasDragOptions {
  /** 插件 */
  plugins: Plugin[];
  /** 元素列表 */
  elements?: ElementType[];
}

export interface ElementType {
  id: string | number;
  width: number | string;
  height: number | string;
  top: number | string;
  left: number | string;
  [key: string]: any;
}

export interface StateData {
  /** 容器元素 */
  el: null | HTMLElement;
  /** 是否移动 */
  isMove: boolean;
  /** 操作类型： */
  type: string;
  /** 选中的元素id */
  selectedIds: Record<string, boolean>;
  /** 元素信息列表 */
  elements: ElementType[];
}
