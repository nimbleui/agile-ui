import type { CommonTypes } from "../common";
import type { PrimitiveProps } from "../Primitive";

export type TextProps = {
  /** 渲染的元素 */
  target?: string;
  /** 文本 */
  text?: string;
} & CommonTypes &
  PrimitiveProps;
