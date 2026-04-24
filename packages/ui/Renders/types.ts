import { SetupContext } from "vue";
import { ComponentProps } from "../../components";

export type RenderItemType<T extends Record<string, any> = any> = {
  [K in keyof T]: {
    /** 组件唯一标识 */
    uuid: number | string;
    /** 上边距 */
    top?: number;
    /** 左边边距 */
    left?: number;
    /** 放在父级组件的那个插槽，如果不传就默认default */
    slotName?: string;
    /** 组件的props */
    props?: T[K];
    /**
     * 创建插槽，true为default插槽
     * @example
     * {title: 'name'} // title是当前组件的插槽名称，映射插槽名称，如果children里有相同的插槽名，默认放在children的后面，如果要放在前面改成{title: 'name-before'}
     */
    slots?: Record<string, string>;
    /**
     * 绑定的事件
     * @example
     * {click: '$temp{{data.click}}'} // $tmp获取配置模板
     * {change: '$act{{data.change}}'} // $act获取配置事件链
     */
    on?: Record<string, string>;
    /**
     * 是否用v-for循环渲染子组件
     * @example
     * "{{data.list}}" // 模板模板字符串，获取data下的list属性作为循环数据
     */
    forEach?: string;
    /** 子组件集合 */
    children?: RenderItemType<T>[];
    /**
     * 控制显示隐藏
     * @example
     * "$if{{data.if}}" // 用v-if方式隐藏
     * "$show{{data.show}}" // 用v-show方式隐藏
     */
    show?: string;
  } & (
    | {
        /** 组件名 */
        component: K;
        slot?: never;
      }
    | {
        /** 插槽内容 */
        slot: SetupContext["slots"][""];
        component?: never;
      }
  );
}[keyof T];

export type ConfigTypes = RenderItemType<ComponentProps<"uuid">>;
export type ConfigList = ConfigTypes[];

// 事件类型
export interface EventConfig {
  /** 事件唯一性标识 */
  id: string | number;
}

export interface BaseRender {
  /** 插槽数据 */
  slots?: SetupContext["slots"];
  /** 表达式模版 */
  template?: Record<string, string>;
  /** 数据源 */
  data: Record<string, any>;
  /** 事件配置 */
  events?: Record<string, EventConfig>;
}

/** renders组件props属性 */
export interface RendersProps extends BaseRender {
  /** 配置参数列表 */
  config: ConfigList;
}

export interface RenderItemProps extends BaseRender {
  /** 配置参数 */
  config: ConfigTypes;
}
