import { Point } from "./utils/math";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: "rect" | "image" | "text" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // In degrees
  fill?: string;
  stroke?: string;
  content?: string; // For text or image url
  opacity?: number;
  groupId?: string;
  zIndex: number;
  locked?: boolean;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  hoveredId: string | null;
  scale: number; // Canvas zoom level
  offset: Point; // Canvas pan offset
  width: number;
  height: number;
  isDragging: boolean;
  dragStart: Point | null;
  activeTool: "select" | "hand" | "draw";
  snapLines: SnapLine[]; // For rendering guides
}

export interface SnapLine {
  type: "vertical" | "horizontal";
  position: number;
  start: number;
  end: number;
}

export type CanvasAction =
  | { type: "UPDATE_ELEMENT"; payload: Partial<CanvasElement> & { id: string } }
  | { type: "ADD_ELEMENT"; payload: CanvasElement }
  | { type: "REMOVE_ELEMENT"; payload: string }
  | { type: "SELECT_ELEMENT"; payload: string | string[] }
  | { type: "SET_HOVER"; payload: string | null }
  | { type: "SET_CANVAS_TRANSFORM"; payload: { scale?: number; offset?: Point } }
  | { type: "SET_TOOL"; payload: CanvasState["activeTool"] }
  | { type: "SET_SNAP_LINES"; payload: SnapLine[] };

export interface PluginContext {
  state: CanvasState;
  dispatch: (action: CanvasAction) => void;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  api: Record<string, any>; // Shared API for inter-plugin communication
}

export interface Plugin {
  name: string;
  onInit?: (context: PluginContext) => void;
  onRender?: (context: PluginContext) => void;
  onMouseDown?: (e: MouseEvent, context: PluginContext) => void;
  onMouseMove?: (e: MouseEvent, context: PluginContext) => void;
  onMouseUp?: (e: MouseEvent, context: PluginContext) => void;
  onKeyDown?: (e: KeyboardEvent, context: PluginContext) => void;
  onDestroy?: () => void;
}
