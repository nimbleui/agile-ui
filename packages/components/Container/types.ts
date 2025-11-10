import { type CommonTypes, type PositionTypes, flexAlign, flexJustify } from "../common";

export type FlexAlign = (typeof flexAlign)[number];
export type FlexJustify = (typeof flexJustify)[number];

export interface ContainerProps extends CommonTypes {
  /** 样式中display属性，默认是flex */
  display?: "flex" | "block" | "inline" | "inline-flex" | "inline-block";
  /** 设置元素单行显示还是多行显示 */
  wrap?: boolean;
  /** 设置元素在主轴方向上的对齐方式 */
  justify?: FlexJustify;
  /** 设置元素在交叉轴方向上的对齐方式 */
  align?: FlexAlign;
  /** flex CSS 简写属性 */
  flex?: string;
  /** 设置网格之间的间隙 */
  gap?: number;
  /** flex 主轴的方向是否垂直，使用 flex-direction: column */
  vertical?: boolean;
  /** 定位类型 */
  position?: PositionTypes;
  /** 层级 */
  zIndex?: number;
}
