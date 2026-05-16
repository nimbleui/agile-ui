import { CSSProperties, InjectionKey, Ref } from "vue";

export interface GridProps {
  /** 水平间隔 或者 [水平间隔, 垂直间隔] */
  gutter?: number | [number, number];
  /** 垂直排列方式 */
  align?: CSSProperties["alignItems"];
  /** 水平排列方式 */
  justify?: CSSProperties["justifyContent"];
  /** 统一设置栅格占据的列数 */
  span?: number;
}

export interface ColProps {
  /** 栅格占据的列数 */
  span?: number;
  /** 栅格左侧的间隔格数 */
  offset?: number;
  /** 栅格向右移动格数 */
  push?: number;
  /** 栅格向左移动格数 */
  pull?: number;
}

interface GridContext {
  gutter: number;
  span: number | undefined;
}

export const gridContextKey: InjectionKey<Ref<GridContext>> = Symbol("gridContextKey");
