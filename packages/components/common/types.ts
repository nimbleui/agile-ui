import { positionTypes } from "./constant";
import { eventTypes } from "./events";

export interface CommonTypes {
  /** 阻止事件冒泡 */
  stop?: boolean;
  /** 组件唯一标识 */
  uuid?: string | number;
  /** 事件对象 */
  events?: { [key in EventType]?: EventItem };
}

export type EventType = (typeof eventTypes)[number];
export interface EventItem {
  /** 执行 */
  execute: {
    code?: string;
    uuid?: string | number;
    type?: "show" | "jump" | "popup" | "request" | "calculate";
  }[];
  /** 点击之前执行，返回false就拦截 */
  before?: () => Promise<boolean | void> | boolean | void;
}

/**  定位值 */
export type PositionTypes = (typeof positionTypes)[number];
