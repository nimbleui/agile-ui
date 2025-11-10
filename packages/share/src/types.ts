export const _toString = Object.prototype.toString;

export function isFunction(el: unknown): el is (...args: any[]) => any {
  return typeof el === 'function';
}

export function isTouchEvent(val: unknown): val is TouchEvent {
  return _toString.call(val) === '[object TouchEvent]';
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number';
}

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean';
}

export function isUndefined(val: unknown): val is undefined {
  return typeof val === 'undefined';
}

export function isObjectLike(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object';
}

export function isArray(val: unknown): val is Array<any> {
  return _toString.call(val) === '[object Array]';
}

export function isPromise(val: unknown): val is Promise<any> {
  return _toString.call(val) === '[object Promise]';
}

export function isArguments(val: unknown): val is IArguments {
  return isObjectLike(val) && _toString.call(val) == '[object Arguments]';
}

export function isObject(
  val: unknown
): val is object | ((...args: any[]) => any) {
  const type = typeof val;
  return val != null && (type === 'object' || type === 'function');
}

export function isPlainObject(val: unknown): val is Record<string, any> {
  if (!isObjectLike(val) || _toString.call(val) != '[object Object]') {
    return false;
  }
  if (Object.getPrototypeOf(val) === null) {
    return true;
  }
  let proto = val;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(val) === proto;
}

export function isDefined(val: unknown) {
  return !isUndefined(val);
}

export function isEmpty(val: unknown) {
  return val === null || val === undefined || val === '';
}

export function isDate(val: unknown): val is Date {
  return _toString.call(val) === '[object Date]';
}

export function isRegExp(val: unknown): val is RegExp {
  return _toString.call(val) === '[object RegExp]';
}

export function isSet(val: unknown): val is Set<any> {
  return _toString.call(val) === '[object Set]';
}

export function isMap(val: unknown): val is Map<any, any> {
  return _toString.call(val) === '[object Map]';
}
