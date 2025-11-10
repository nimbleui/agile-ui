/**
 * 补齐位数
 * @param value 目标
 * @param len 位数
 * @param pad 填充值
 * @returns
 */
export function padStart(value: string | number, len: number, pad?: string) {
  const s = String(value);
  if (s.length == len) return s;
  return s.padStart(len, pad ?? '0');
}
