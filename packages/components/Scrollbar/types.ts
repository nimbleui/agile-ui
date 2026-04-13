import type { PrimitiveProps } from "../Primitive/Primitive";

interface CommonProps {
  /** 显示滚动条的时机，'none' 表示一直显示 */
  type?: "hover" | "none";
  /** 滚动条最小尺寸， 默认 20 */
  minSize?: number;
  /** 滚动条距离边界的值 */
  gap?: number;
}

export type ScrollbarProps = CommonProps & PrimitiveProps;

export interface ScrollbarThumbProps extends CommonProps {
  /** 垂直 */
  isVertical?: boolean;
}

export interface ScrollbarThumbInstance {
  handleScroll: (wrap: HTMLElement) => void;
  update: (wrap: HTMLElement) => void;
}
