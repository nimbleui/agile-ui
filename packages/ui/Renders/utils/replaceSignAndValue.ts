import { getSignAndValueReg, getSignAndValueGReg } from "./constant";

/**
 * 把格式为$xxx{{xxx}}的模板，替换成真实的值
 * @param str 模板字符串
 * @param callback 回调函数
 */
export function replaceSignAndValue(
  str: string,
  options: { callback: (data: { temp: string; sign: string; value: string }) => string; isGlobal?: boolean },
) {
  const { callback, isGlobal } = options;
  return str.replace(isGlobal ? getSignAndValueGReg : getSignAndValueReg, (temp, sign, value) => {
    return callback({ temp, sign, value });
  });
}

/**
 * 获取模板为$xxx{{xxx}}格式的值
 * @param str 模板字符串
 * @returns
 */
export function getSignAndValue(str: string | null | undefined) {
  if (!str) return null;

  const match = str.match(getSignAndValueReg);
  if (!match) return null;
  return { temp: match[0], sign: match[1], value: match[2] };
}
