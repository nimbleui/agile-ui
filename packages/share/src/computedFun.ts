import {isFunction} from './types';

export type FuncType<T, D> = (arg?: D) => T;

/**
 * 执行一个函数逻辑
 * @param value 目标
 * @param data
 * @returns
 */
export const computedFun = <T, D>(value: FuncType<T, D> | T, data?: D) => {
  if (isFunction(value)) {
    return value(data) as ReturnType<typeof value>;
  }
  return value;
};

/**
 * 执行对象中指定的属性函数
 * @param objData 目标对象
 * @param data 属性函数的参数
 * @param pickField 属性
 * @returns
 */
export const computedFunObj = <T extends Record<string, any>, D = any>(
  objData: T,
  data: D,
  pickField: (keyof T)[]
) => {
  const newObj: T = {...objData};
  pickField.forEach((key) => {
    if (objData[key] !== undefined) {
      newObj[key] = computedFun(objData[key], data);
    }
  });
  return newObj;
};

/**
 * 执行数组中指定的属性函数
 * @param objData 目标对象
 * @param data 属性函数的参数
 * @param pickField 属性
 * @returns
 */
export const computedFunList = <T extends Record<string, any>, D>(
  dataList: T[],
  data: D,
  pickField: (keyof T)[]
) => {
  return dataList.map((item) => {
    return computedFunObj(item, data, pickField);
  });
};
