/**
 * 创建事件
 */
export function createBindEvent<T extends Record<string, (...args: any[]) => void>>() {
  const all = new Map<keyof T, Array<(...args: any[]) => void>>();

  return {
    on: <K extends keyof T>(type: K, handler: T[K]) => {
      const handlers = all.get(type);
      if (handlers) {
        handlers.push(handler);
      } else {
        all.set(type, [handler]);
      }
    },
    emit<K extends keyof T>(type: K, ...args: Parameters<T[K]>) {
      const handlers = all.get(type);
      if (!handlers) return;
      handlers.forEach((handler) => {
        handler(...args);
      });
    },
    off<K extends keyof T>(type: K, handler?: T[K]) {
      const handlers = all.get(type);
      if (!handler) {
        all.delete(type);
        return;
      }

      if (handlers) {
        all.set(
          type,
          handlers.filter((item) => item != handler),
        );
      }
    },
  };
}
