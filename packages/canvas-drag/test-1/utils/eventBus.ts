import { IEventBus, EventCallback } from "../types";

// 简单的事件总线实现，用于组件间通信
export class EventBus implements IEventBus {
  // 存储事件监听器
  private listeners: Record<string, EventCallback[]> = {};

  // 注册事件监听
  on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // 移除事件监听
  off(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  // 触发事件
  emit(event: string, payload?: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((cb) => cb(payload));
  }
}
