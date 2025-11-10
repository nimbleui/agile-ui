import { isArray, isPlainObject } from "./types";

type iterateeArray<T> = (item: T, index: number, array: T[]) => void | boolean;
type iterateeObject<T> = <K extends keyof T>(value: T[K], key: K, obj: T) => void | boolean;

/**
 * 循环数组
 * @param array 数组
 * @param iteratee 迭代器，如果返回false终止循环
 * @returns
 */
export function arrayEach<T = any>(array: T[], iteratee: iterateeArray<T>) {
  let index = -1;
  const length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * 循环对象
 * @param array 对象
 * @param iteratee 迭代器，如果返回false终止循环
 * @returns
 */
export function objectEach<T extends Record<string | number, any>>(obj: T, iteratee: iterateeObject<T>) {
  for (const key in Object(obj)) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key != "constructor") {
      if (iteratee(obj[key], key as keyof T, obj) === false) {
        break;
      }
    }
  }

  return obj;
}

export function forEach<T>(obj: T[], iteratee: iterateeArray<T>): T[];
export function forEach<T>(obj: T, iteratee: iterateeObject<T>): T;
export function forEach(obj: any, iteratee: any) {
  if (isArray(obj)) {
    return arrayEach(obj, iteratee);
  } else if (isPlainObject(obj)) {
    return objectEach(obj, iteratee);
  }

  return obj;
}
