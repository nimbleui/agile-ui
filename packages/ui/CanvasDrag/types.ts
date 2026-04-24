import { ElementType } from "@canvas-drag/core";

export interface CanvasDragProps<T extends ElementType> {
  data: T[];
}
