import { CSSProperties } from "vue";

export interface FlexProps {
  /** 垂直排列方式 */
  align?: CSSProperties["alignItems"];
  /** 是否为行内元素 */
  inline?: boolean;
  /** 水平排列方式 */
  justify?: CSSProperties["justifyContent"];
  /** 为数字时，是水平和垂直间距 */
  size?: number | [number, number];
  /** 是否垂直布局 */
  vertical?: boolean;
  /** 是否超出换行 */
  wrap?: boolean;
}
