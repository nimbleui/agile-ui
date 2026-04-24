export * from "./Close";
export * from "./CollectRoot";
export * from "./Mask";
export * from "./Container";

import { YText, type TextProps } from "./Text";
import { YMask, type MaskProps } from "./Mask";
import { YClose, type CloseProps } from "./Close";
import { YContainer, type ContainerProps } from "./Container";
import { YCollectRoot, type CollectRootProps } from "./CollectRoot";
import { YInput, type InputProps } from "./Input";
import { YField, type FieldProps } from "./Field";
import { YScrollbar, type ScrollbarProps } from "./Scrollbar";
import { YVirtualList, type VirtualListProps } from "./VirtualList";
import { YTreeVirtual, type TreeVirtualProps } from "./TreeVirtual";
import { CommonTypes } from "./common";

export const components = {
  YText,
  YClose,
  YCollectRoot,
  YMask,
  YContainer,
  YInput,
  YField,
  YScrollbar,
  YVirtualList,
  YTreeVirtual,
};
export interface ComponentProps<K extends keyof CommonTypes = never> {
  /** 文本组件 */
  YText: Omit<TextProps, K>;
  /** 遮罩层组件 */
  YMask: Omit<MaskProps, K>;
  /** 关闭组件 */
  YClose: Omit<CloseProps, K>;
  /** 容器组件 */
  YContainer: Omit<ContainerProps, K>;
  /** 根节点组件 */
  YCollectRoot: Omit<CollectRootProps, K>;
  /** input组件 */
  YInput: Omit<InputProps, K>;
  /** field组件 */
  YField: Omit<FieldProps, K>;
  /** 虚拟列表组件 */
  YVirtualList: Omit<VirtualListProps, K>;
  /** 虚拟树形组件 */
  YTreeVirtual: Omit<TreeVirtualProps, K>;
  /** 滚动条组件 */
  YScrollbar: Omit<ScrollbarProps, K>;
}
