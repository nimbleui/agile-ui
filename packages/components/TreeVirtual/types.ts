export type TreeVirtualNode<T> = T & {
  /** 节点层级 */
  level: number;
  /** 是否有子节点 */
  isLeaf: boolean;
  /** 是否展开 */
  expanded: boolean;
  /** 异步加载中 */
  loading: boolean;
  /** 父id */
  parentId: string | number | null;
};

export interface TreeVirtualProps<T = Record<string, any>> {
  /** 数据源 */
  data: T[];
  /** 唯一标识的Key */
  idKey?: keyof T;
  /** 子级的key */
  childrenKey?: keyof T;
  /** 容器高度 */
  height: number;
  /** 子级缩进距离 默认 20 */
  indent?: number;
  /** 是否可多选 */
  checkable?: boolean;
  /** 项的最小高度*/
  itemSize: number;
  /** 展开/折叠图标位置 */
  expandSite?: "start" | "end";
  /** 异步加载函数 */
  loadChildren?: (node: TreeVirtualNode<T>) => Promise<TreeVirtualNode<T>[]>;
}
