import type { ConfigTypes } from "../Render";

export interface RenderComponentProps {
  /** 组件的元素组成配置 */
  elements: ConfigTypes[];
  props?: any;
}
