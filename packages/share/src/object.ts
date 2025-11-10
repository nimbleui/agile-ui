import {forEach} from './forEach';
import {isEmpty, isPlainObject, isString} from './types';

/**
 * 排除 obj 的属性组成新的对象
 * @param data 对象
 * @param keys 对象中的属性
 * @returns
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  data: T,
  keys: K[]
) {
  const result: T = {...data} as T;
  keys.forEach((key) => {
    if (key in data) {
      delete result[key];
    }
  });
  return result;
}

/**
 * 选择 obj 的属性组成新的对象
 * @param obj 对象
 * @param paths 对象中的属性
 * @returns {Object}
 */
export function pick<T extends {[key: string]: any}, U extends keyof T>(
  obj: T,
  paths: Array<U>,
  callback?: (value: any) => any
): Pick<T, U> {
  let index = -1;
  const length = paths.length;
  const result = {} as Pick<T, U>;

  while (obj != null && ++index < length) {
    const path = paths[index];
    const value = obj[path];
    if (!isEmpty(value)) {
      result[path] = callback ? callback(value) : value;
    }
  }
  return result;
}

/**
 * 获取obj 所有属性
 * @param obj 目标对象
 * @returns
 */
export function keysOf<T extends Record<string, unknown>>(
  obj: T
): Array<keyof T> {
  return Object.keys(obj);
}

export function formaKeyOfValue<
  T extends {[key: string]: any},
  K extends keyof T
>(obj: T, keys: Array<K>): {[K in (typeof keys)[number]]: T[K]};
export function formaKeyOfValue<
  T extends {[key: string]: any},
  K extends keyof T,
  C extends (val: T[K], key: K) => any
>(obj: T, keys: Array<K>, callback: C): {[R in K]: ReturnType<C>};
/**
 * 取对象部分值，返回新的对象
 * @param obj 目标对象
 * @param keys key数组
 * @param callback 转换值的函数
 * @returns
 */
export function formaKeyOfValue<
  T extends {[key: string]: any},
  K extends keyof T,
  C extends (val: T[K], key: K) => any
>(obj: T, keys: Array<K>, callback?: C) {
  const result = {} as {[K in (typeof keys)[number]]: ReturnType<C> | T[K]};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    result[key] = callback?.(obj[key], key) ?? obj[key];
  }
  return result;
}

/**
 * 去除属性字符串中的收尾空格
 * @param data 目标
 */
export function objTrim<T extends {[key: string]: any}>(data: T) {
  if (!data) return;
  forEach(data, (val, key) => {
    if (isString(val)) {
      data[key] = val.trim();
    } else if (isPlainObject(val)) {
      objTrim(val);
    }
  });
}

/**
 * 对象转成数组
 * @param data 目标对象
 * @param keys 取那些key的值
 * @returns
 */
export function mapToArray<T>(data: {[key: string | number]: T}): T[];
export function mapToArray<T extends Record<string, any>, K extends keyof T>(
  data: {[key: string | number]: T},
  keys: K[]
): Pick<T, K>[];
export function mapToArray<T extends Record<string, any>, K extends keyof T>(
  data: {[key: string | number]: T},
  keys?: K[]
): T[] | Pick<T, K>[] {
  const arr: (T | Pick<T, K>)[] = [];

  forEach(data, (item) => {
    if (keys && isPlainObject(item)) {
      arr.push(pick(item, keys));
    } else {
      arr.push(item);
    }
  });

  return arr;
}
