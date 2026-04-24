/**
 * LRU（最近最少使用）缓存实现
 * 用于缓存已编译的 AST 或执行计划，提升重复表达式性能
 */
export class LRUCache<K, V> {
  // 缓存映射：键 -> { 值, 最后访问时间戳 }
  private cache = new Map<K, { value: V; lastAccess: number }>();
  private readonly maxSize: number; // 最大容量

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * 获取缓存项，若存在则更新访问时间并返回值，否则返回 undefined
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccess = Date.now(); // 更新访问时间
      return entry.value;
    }
    return undefined;
  }

  /**
   * 存入缓存项，若已满则淘汰最久未使用的项
   */
  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU(); // 触发淘汰
    }
    this.cache.set(key, { value, lastAccess: Date.now() });
  }

  /**
   * 检查键是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 淘汰最近最少使用的项（访问时间最早的）
   */
  private evictLRU(): void {
    let oldestKey: K | null = null;
    let oldestTime = Infinity;

    // 遍历所有条目，找到最早访问时间
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    // 删除该条目
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
