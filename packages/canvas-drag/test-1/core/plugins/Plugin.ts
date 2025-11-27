import { CanvasCore } from "../CanvasCore";

export interface CanvasPlugin {
  name: string;
  init(core: CanvasCore): void;
  destroy(): void;
}
