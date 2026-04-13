export interface VirtualListProps<T> {
  /** 列表 */
  items: T[];
  /** 缓冲区，避免滚动时闪烁 默认 5 */
  buffer?: number;
  /** 获取唯一key */
  itemKey: (item: T) => string | number;
  /** 项默认高度  默认 50*/
  itemSize?: number;
  /** 触发加载的距离阈值，默认是50 */
  distance?: number;
  /** 上拉加载回调 */
  loadMore?: () => Promise<void>;
  /** 列表每一项渲染为元素或组件，可被 asChild 覆盖 */
  as?: string;
  /** 将默认渲染的元素更改为传递的子元素，合并它们的属性和行为 */
  asChild?: boolean;
}

export interface VirtualListItemProps<T> {
  /** 数据 */
  item: T;
  /** 项默认高度  默认 50*/
  itemSize?: number;
}

export interface VirtualScrollToOptions extends ScrollToOptions {
  index?: number;
  key?: number | string;
  position?: "top" | "bottom";
  debounce?: boolean;
}
