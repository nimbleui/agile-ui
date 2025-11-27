// 坐标点接口
export interface Point {
  x: number;
  y: number;
}

// 尺寸接口
export interface Size {
  width: number;
  height: number;
}

// 矩形接口，包含坐标、尺寸和旋转角度
export interface Rect extends Point, Size {
  rotation: number; // 旋转角度（度）
}

// 画布元素接口
export interface CanvasElement extends Rect {
  id: string; // 唯一标识符
  type: string; // 元素类型
  selected?: boolean; // 是否被选中
  draggable?: boolean; // 是否可拖拽
  resizable?: boolean; // 是否可调整大小
  rotatable?: boolean; // 是否可旋转
  parentId?: string; // 父元素ID（用于组合）
  style?: Record<string, any>; // 样式对象
  data?: any; // 自定义数据
}

// 操作手柄类型：北、南、东、西、东北、西北、东南、西南、旋转
export type HandleType = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | "rotate";

// 变换状态接口（用于拖拽、缩放、旋转过程中的状态记录）
export interface TransformState {
  isDragging: boolean; // 是否正在拖拽
  isResizing: boolean; // 是否正在调整大小
  isRotating: boolean; // 是否正在旋转
  startPoint: Point; // 变换开始时的鼠标位置
  startElement: CanvasElement | null; // 变换开始时的元素状态
  handleType: HandleType | null; // 当前操作的手柄类型
}

// 画布配置接口
export interface CanvasConfig {
  width: number; // 画布宽度
  height: number; // 画布高度
  gridSize?: number; // 网格大小
  snapToGrid?: boolean; // 是否吸附网格
  showGuides?: boolean; // 是否显示辅助线
  zoom?: number; // 缩放比例
  snapThreshold?: number; // 吸附阈值
}

// 事件回调函数类型
export type EventCallback = (payload: any) => void;

// 事件总线接口
export interface IEventBus {
  on(event: string, callback: EventCallback): void; // 订阅事件
  off(event: string, callback: EventCallback): void; // 取消订阅
  emit(event: string, payload?: any): void; // 触发事件
}

// 吸附辅助线接口
export interface SnapGuide {
  type: "vertical" | "horizontal"; // 辅助线类型：垂直或水平
  position: number; // 辅助线位置坐标
}
