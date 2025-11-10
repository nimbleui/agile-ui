import { CommonTypes } from "../common";

export interface TextProps extends CommonTypes {
  /** 渲染的元素 */
  target?: string;
  /** 文本 */
  text?: string;
}
