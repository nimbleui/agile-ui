/**
 * 获取对象属性值
 * @param data 数据
 * @param path 路径
 * @param defaultValue 默认值
 * @returns
 */
export function getValue<T = any, D = any>(
  data: D,
  path?: string,
  defaultValue?: T
): T {
  if (!path || !data || typeof data !== 'object') {
    return data as unknown as T;
  }

  // 将数组索引语法转换为点语法：list[0] -> list.0
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const res = normalizedPath.split('.').reduce((acc, key) => (acc as any)?.[key], data);
  return (res ?? defaultValue) as T
}
