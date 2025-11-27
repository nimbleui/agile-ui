import { CanvasCore } from "../CanvasCore";

export type PluginCleanup = () => void;
export type CanvasPlugin = (core: CanvasCore) => PluginCleanup;
