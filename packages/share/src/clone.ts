import {arrayEach, objectEach} from './forEach';
import {_toString, isArray, isDate, isMap, isRegExp, isSet} from './types';

function getCtor<T extends Record<string | number, any>>(
  val: T,
  args?: any
): T {
  const Ctor = val.__proto__.constructor;
  return args ? new Ctor(args) : new Ctor();
}

function handleValueClone(item: any, isDeep: boolean) {
  return isDeep ? copyValue(item, isDeep) : item;
}

function copyValue(val: any, isDeep: boolean) {
  if (!val) return val;

  if (_toString.call(val) == '[object Object]') {
    // 克隆对象
    const restObj = Object.create(Object.getPrototypeOf(val));
    objectEach(val, function (item, key) {
      restObj[key] = handleValueClone(item, isDeep);
    });
    return restObj;
  } else if (isDate(val) || isRegExp(val)) {
    // 克隆时间、正则
    return getCtor(val, val.valueOf());
  } else if (isArray(val)) {
    // 克隆对象
    const restArr: typeof val = [];
    arrayEach(val, (item) => {
      restArr.push(handleValueClone(item, isDeep));
    });
    return restArr;
  } else if (isSet(val)) {
    const restSet = getCtor(val);
    restSet.forEach((item) => {
      restSet.add(handleValueClone(item, isDeep));
    });
    return restSet;
  } else if (isMap(val)) {
    const restMap = getCtor(val);
    restMap.forEach((item, key) => {
      restMap.set(key, handleValueClone(item, isDeep));
    });
    return restMap;
  }
  return val;
}

/**
 * 浅拷贝/深拷贝
 *
 * @param {Object} obj 对象/数组
 * @param {Boolean} deep 是否深拷贝
 * @return {Object}
 */
export function clone<T = any>(obj: T, deep: boolean): T {
  if (obj) {
    return copyValue(obj, deep);
  }
  return obj;
}
