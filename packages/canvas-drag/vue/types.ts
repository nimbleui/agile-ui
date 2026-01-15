import { ElementType, EventTypes, Plugin } from "../types";

export interface CanvasDragProps {
  /** 画布缩放比例 */
  zoom?: number;
  /** 画布的宽度 */
  width?: string | number;
  /** 画布的高度 */
  height?: string | number;
  /** canvasDrag的插件 */
  plugins: Plugin[];
}

interface GetParameter<T extends any[]> {
  ids: T["1"];
  elements: T["0"];
}

export interface CanvasDragEmits<T extends ElementType> {
  (e: "drag", data: GetParameter<Parameters<EventTypes["drag"]>>): void;
  (e: "scale", data: GetParameter<Parameters<EventTypes["scale"]>>): void;
  (e: "rotate", data: GetParameter<Parameters<EventTypes["rotate"]>>): void;
  (e: "change", data: T[]): void;
  (e: "custom", data: { type: string; data: any }): void;
}
