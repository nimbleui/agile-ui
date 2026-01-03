import { EventTypes } from "../types";

export interface CanvasDragProps {
  zoom?: number;
}

interface GetParameter<T extends any[]> {
  ids: T["1"];
  elements: T["0"];
}

export interface CanvasDragEmits {
  (e: "drag", data: GetParameter<Parameters<EventTypes["drag"]>>): void;
  (e: "scale", data: GetParameter<Parameters<EventTypes["scale"]>>): void;
  (e: "rotate", data: GetParameter<Parameters<EventTypes["rotate"]>>): void;
}
