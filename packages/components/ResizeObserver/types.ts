import type { PrimitiveProps } from "../Primitive";

export type ResizeEvent<T = any> = (data: { item?: T; el: HTMLElement; height: number; width: number }) => void;
export type ResizeEventParam<T = any> = Parameters<ResizeEvent<T>>[0];

export interface ResizeObserverProps<T> extends PrimitiveProps {
  /** 数据 */
  item?: T;
}
