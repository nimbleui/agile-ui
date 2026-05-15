export interface GridProps {
  /** 水平间隔 或者 [水平间隔, 垂直间隔] */
  gutter?: number | [number, number];
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
