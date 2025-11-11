import type { SetupContext } from "vue";
import type { ComponentProps } from "@agile-ui/components";

export type ConfigItem<T extends Record<string, any> = any> = {
  [K in keyof T]: {
    /** 上边距 */
    top?: number;
    /** 左边边距 */
    left?: number;
    /** 控制显隐 */
    show?: string;
    /** 显隐类型 */
    showType?: "if" | "show";
    /** 放在那个插槽 */
    slotName?: string;
    /** 组件唯一标识 */
    uuid: string | number;
    /** 组件的props */
    props?: T[K];
    /** 子组件集合 */
    children?: ConfigItem<T>[];
    /** 创建插槽，true为default插槽 */
    slots?: Record<string, string>;
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

export type ConfigTypes = ConfigItem<ComponentProps<"uuid">>;
export type ConfigList = ConfigTypes[];

export interface BaseRender {
  /** 插槽数据 */
  slots?: SetupContext["slots"];
  /** 表达式模版 */
  template?: Record<string, string>;
  /** 数据源 */
  data: Record<string, any>;
  /** 行为配置 */
  actions?: Record<string, EventConfig>;
}

export interface RenderProps extends BaseRender {
  /** 配置参数列表 */
  config: ConfigList;
}

export interface RenderItemProps extends BaseRender {
  /** 配置参数 */
  item: ConfigTypes;
}

export interface EventConfig {
  id: string;
  type: string;
  name: string;
  /** 前置条件 */
  conditions?: ConditionTypes[];
  /** 执行的动作链 */
  actions: ActionConfig[];
  /** 条件不满足时执行的动作链 */
  elseActions?: ActionConfig[];
  /** 延迟执行(ms) */
  delay?: number;
}
export interface ConditionTypes {
  /** 唯一性标识 */
  id: string;
  /** 条件类型 */
  type: "expression" | "function" | "api";
  /** JS表达式 */
  expression?: string;
  /** 函数名 */
  function?: string;
  /** API地址 */
  api?: string;
  /** 参数 */
  params?: Record<string, any>;
  /** 逻辑连接符 */
  logical?: "and" | "or";
  /** 错误提示语 */
  message?: string;
}

interface ActionConfig {
  id: string;
  type: string;
  /** 目标组件/API/函数 */
  target?: string;
  /** 参数 */
  params?: Record<string, any>;
  /** 延迟执行 */
  delay?: number;
  /** 动作级别的条件 */
  conditions?: ConditionTypes[];
  /** 下一个动作 */
  next?: ActionConfig | string;
  /** 错误处理 */
  errorHandler?: ActionConfig;
}
