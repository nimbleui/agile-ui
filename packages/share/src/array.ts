import {isArray} from './types';

/**
 * 把目标转成数组
 * @param item 目标
 * @returns {Array}
 */
export const toArray = <T>(item: T | T[]): T[] =>
  Array.isArray(item) ? item : [item];

/**
 * 根据key、value查找数组对象的对象
 * @param arr 数组
 * @param key 属性
 * @param value 值
 * @param attr 返回属性值
 * @returns
 */
export function getAttrValue<T extends Array<Record<string, any>>>(
  arr: T,
  key: string,
  value: string | number | Array<string | number>,
  attr?: string
) {
  if (!arr?.length) return null;

  const result: any[] = [];

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (isArray(value)) {
      if (value.includes(item[key])) {
        result.push(attr ? item[attr] : item);
      }
    } else {
      if (item[key] == value) {
        return attr ? item[attr] : item;
      }
    }
  }

  if (result.length) return result;
  return null;
}

/**
 * 根据数组对象中的一个属性转成对象，对象key：属性值； value：对应对象，如果有key就把那个key的值赋给Value
 * @param arr 目标数组
 * @param field 属性
 * @param key 属性
 * @returns
 */
export function arrayToMap<T extends Record<string, any>>(
  arr: ArrayLike<T>,
  field: keyof T,
  key?: keyof T
) {
  const result: {[key: string]: T} = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    const value = item[field];
    if (value != null) result[value] = key ? item[key] : item;
  }

  return result;
}

/**
 * 在数组中指定字段值的项后面插入新数据
 * @param {Array} arr - 原始数组
 * @param {string} field - 要匹配的字段名
 * @param {*} value - 要匹配的字段值
 * @param {Array} dataToInsert - 要插入的数据数组
 * @param {boolean} insertBefore - 是否插入到匹配项前面，默认false(插入后面)
 * @returns {Array} - 新数组
 */
export function insertArray<T extends Record<string, any>>(
  arr: T[],
  field: keyof T,
  value: any,
  dataToInsert: T[],
  insertBefore = false
) {
  // 创建原数组的浅拷贝
  const newArr = [...arr];

  // 查找匹配项的索引
  const index = newArr.findIndex((item) => item[field] === value);

  // 如果没有找到匹配项，根据insertBefore决定插入位置
  if (index === -1) {
    return insertBefore
      ? [...dataToInsert, ...newArr]
      : [...newArr, ...dataToInsert];
  }

  // 计算插入位置
  const insertIndex = insertBefore ? index : index + 1;

  // 插入数据
  newArr.splice(insertIndex, 0, ...dataToInsert);

  return newArr;
}

/**
 * 排除指定项
 * @param arr
 * @param field
 * @param keys
 * @returns
 */
export const omitArray = <T extends Record<string, any>>(
  arr: T[],
  field: keyof T,
  keys: any[]
) => {
  return arr.filter((item) => !keys.includes(item[field]));
};

/**
 * 筛选指定字段
 * @param arr
 * @param field
 * @param values
 * @returns
 */
export const pickArray = <T extends Record<string, any>>(
  arr: T[],
  field: keyof T,
  values: any[]
) => {
  const result: T[] = [];
  values.forEach((value) => {
    const itemRes = arr.find((item2) => item2[field] === value);
    if (itemRes) {
      result.push(itemRes);
    }
  });
  return result;
};
