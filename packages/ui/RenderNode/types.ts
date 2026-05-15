/** 属性值可以是静态值、表达式对象或嵌套对象 */
export type PropValue = string | number | boolean | Record<string, any>;

export interface LoopTypes {
  /** 唯一标识，默认是id */
  key?: string;
  /** 数据源表达式，如：{{data.list}} */
  source: string;
  /** 每一个的key，默认是$item */
  itemName?: string;
  /** 索引，默认是$index */
  indexName?: string;
}

/** 节点定义：递归树结构的核心，描述任何一个 UI 元素 */
export interface NodeTypes {
  /** 节点唯一标识 */
  id: string;
  /**
   * @description 组件名
   * @example
   * "div" // 普通元素名称
   * "YMask" // 组件名称
   * "$slot:title" // 创建插槽一个插槽为title： $slot是插槽标识，创建的插槽名称为title
   */
  component: string;
  /** 传递给组件的属性，值可以是表达式 */
  props?: Record<string, PropValue>;
  /** 事件绑定，键为事件名（如 'click'） */
  events?: Record<string, any>;
  /** 默认插槽的子节点 */
  children?: NodeTypes[];
  /** 具名插槽，键为插槽名 */
  slots?: Record<string, NodeTypes[]>;
  /** 条件渲染表达式，返回false则不渲染 */
  condition?: string;
  /** 循环渲染配置 */
  loop?: LoopTypes;
}

/* 组件 prop 声明的元数据（用于组件定义） */
export interface PropDecl {
  /** prop 名称 */
  name: string;
  /** 类型描述，如 'string'、'boolean' */
  type: string;
  /** 说明 */
  description?: string;
  /** 默认值 */
  default?: any;
}

/* 组件插槽声明的元数据 */
export interface SlotDecl {
  /** 插槽名称（'default' 为默认插槽） */
  name: string;
  /** 说明 */
  description?: string;
}

/** 复合组件的完整定义，包含元数据与内部模板 */
export interface ComponentDefinition {
  /** 组件唯一名称 */
  componentName: string;
  /** 显示名称 */
  label?: string;
  /** 对外暴露的属性列表 */
  props: PropDecl[];
  /** 对外暴露的插槽列表 */
  slots: SlotDecl[];
  /** 内部组件树（模板） */
  template: NodeTypes;
}

/** 全局组件注册表中的一个条目，可以是原子组件或复合组件 */
export interface ComponentRegistryItem {
  /** 组件名，全局唯一 */
  name: string;
  /** 组件类型 */
  type: "atomic" | "composite";
  /** 分类（用于左侧面板） */
  category?: string;
  /** 图标 */
  icon?: string;
  /** 显示名称 */
  label?: string;
  /** 复合组件专属：完整定义 */
  definition?: ComponentDefinition;
  /** 是否在面板中隐藏 */
  hidden?: boolean;
}
