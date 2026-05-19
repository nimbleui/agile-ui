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
import { YCol, YGrid } from "./Grid";
import { YModel } from "./Model";
import { YFlex } from "./Flex";

export const components = {
  YText,
  YClose,
  YCollectRoot,
  YMask,
  YContainer,
  YInput,
  YField,
  YScrollbar,
  YCol,
  YGrid,
  YModel,
  YFlex,
  YVirtualList,
  YTreeVirtual,
};

export const atomicComponent: { name: string; type: "atomic"; label: string }[] = [
  { name: "YText", type: "atomic", label: "文本" },
  { name: "YClose", type: "atomic", label: "关闭" },
  { name: "YMask", type: "atomic", label: "遮罩层" },
  { name: "YContainer", type: "atomic", label: "容器" },
  { name: "YInput", type: "atomic", label: "输入框" },
  { name: "YField", type: "atomic", label: "列" },
  { name: "YScrollbar", type: "atomic", label: "滚动条" },
  { name: "YGrid", type: "atomic", label: "栅格布局" },
  { name: "YCol", type: "atomic", label: "栅格列" },
  { name: "YModel", type: "atomic", label: "弹框组件" },
  { name: "YFlex", type: "atomic", label: "弹性组件" },
  { name: "YVirtualList", type: "atomic", label: "虚拟列表" },
  { name: "YTreeVirtual", type: "atomic", label: "虚拟树形" },
];

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
