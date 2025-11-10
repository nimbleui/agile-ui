import {isUndefined, padStart} from '.';

type DateType = string | Date | number | undefined | null | number[] | object;
const REGEX_PARSE =
  /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
const REGEX_FORMAT =
  /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|h{1,2}|m{1,2}|s{1,2}|SSS/g;

function parseDate(date: DateType, config?: {utc?: boolean}) {
  if (date === null) return new Date(NaN); // null is invalid
  if (isUndefined(date)) return new Date(); // today
  if (date instanceof Date) return new Date(date);
  if (typeof date === 'string' && !/Z$/i.test(date)) {
    const d = date.match(REGEX_PARSE);
    if (d) {
      const Y = Number(d[1]);
      const M = Number(d[2]) - 1;
      const D = Number(d[3]) || 1;
      const HH = Number(d[4]) || 0;
      const MM = Number(d[5]) || 0;
      const SS = Number(d[6]) || 0;
      const MS = Number((d[7] || '0').substring(0, 3));
      if (config?.utc) {
        return new Date(Date.UTC(Y, M, D, HH, MM, SS, MS));
      }
      return new Date(Y, M, D, HH, MM, SS, MS);
    }
  }

  return new Date(date as any);
}

export enum Unit {
  ms = 'millisecond',
  s = 'second',
  m = 'minute',
  h = 'hour',
  D = 'day',
  M = 'month',
  Y = 'year',
}

/**
 * 判断是否时间类型
 * @param date 目标
 */
export function isValidDate(date: DateType) {
  const d = parseDate(date);
  return d.toString() == 'Invalid Date';
}

/**
 * 判断是否是时间，是返回Date，否则null
 * @param date 目标
 */
export function getDate(date: DateType) {
  const d = parseDate(date);
  if (d.toString() == 'Invalid Date') return null;
  return d;
}

/**
 * 获取时间的年月日时分秒等
 * @param date 时间
 */
export function getDateInfo(date: DateType) {
  const d = getDate(date);
  if (!d) return null;

  return {
    Y: d.getFullYear(),
    M: d.getMonth(),
    D: d.getDate(),
    W: d.getDay(),
    h: d.getHours(),
    m: d.getMinutes(),
    s: d.getSeconds(),
    ms: d.getMilliseconds(),
    date: d,
  };
}

/**
 * 格式化时间
 * @param date 目标
 * @param format 格式化方式 Y：年 M：月 D：日 h：时 m：分 s：秒
 */
export function formatDate(date: DateType, format: string = 'YYYY-MM-DD') {
  const d = getDateInfo(date);
  if (!d) return null;

  const matches = (match: string) => {
    switch (match) {
      case 'YY':
        return String(d.Y).slice(-2);
      case 'YYYY':
        return d.Y;
      case 'M':
        return d.M + 1;
      case 'MM':
        return padStart(d.M + 1, 2);
      case 'D':
        return d.D;
      case 'DD':
        return padStart(d.D, 2, '0');
      case 'h':
        return d.h;
      case 'hh':
        return padStart(d.h, 2, '0');
      case 'm':
        return d.m;
      case 'mm':
        return padStart(d.m, 2, '0');
      case 's':
        return d.s;
      case 'ss':
        return padStart(d.s, 2, '0');
    }
  };

  return format.replace(REGEX_FORMAT, (match, $1) => $1 || matches(match));
}

/**
 * 获取时间戳
 * @param date 目标
 * @param unit 单位
 */
export function getTimeDate(date: DateType, unit?: Unit) {
  const d = getDateInfo(date);
  if (!d) return null;
  const {Y, M, D, h, m, s, ms} = d;
  let result = new Date(Y, M, D, h, m, s, ms);
  switch (unit) {
    case Unit.s:
      result = new Date(Y, M, D, h, m, s);
      break;
    case Unit.m:
      result = new Date(Y, M, D, h, m);
      break;
    case Unit.h:
      result = new Date(Y, M, D, h);
      break;
    case Unit.D:
      result = new Date(Y, M, D);
      break;
    case Unit.M:
      result = new Date(Y, M, 1);
      break;
    case Unit.Y:
      result = new Date(Y, 0, 1);
      break;
  }
  return result.getTime();
}

/**
 * 判断两个时间是否相等
 * @param date 时间
 * @param that 时间
 * @param unit 单位
 */
export function isSameDate(date: DateType, that: DateType, unit?: Unit) {
  return getTimeDate(date, unit) === getTimeDate(that, unit);
}

/**
 * 判断第一个时间是否小于第二时间
 * @param date 时间
 * @param that 时间
 * @param unit 单位
 */
export function ltDate(date: DateType, that: DateType, unit?: Unit) {
  const first = getTimeDate(date, unit);
  const second = getTimeDate(that, unit);

  if (!first || !second) return false;
  return first < second;
}

/**
 * 判断第一个时间是否小于等于第二时间
 * @param date 时间
 * @param that 时间
 * @param unit 单位
 */
export function lteDate(date: DateType, that: DateType, unit?: Unit) {
  const first = getTimeDate(date, unit);
  const second = getTimeDate(that, unit);

  if (!first || !second) return false;
  return first <= second;
}

/**
 * 判断第一个时间是否大于第二时间
 * @param date 时间
 * @param that 时间
 * @param unit 单位
 */
export function gtDate(date: DateType, that: DateType, unit?: Unit) {
  const first = getTimeDate(date, unit);
  const second = getTimeDate(that, unit);

  if (!first || !second) return false;
  return first > second;
}

/**
 * 判断第一个时间是否大于等于第二时间
 * @param date 时间
 * @param that 时间
 * @param unit 单位
 */
export function gteDate(date: DateType, that: DateType, unit?: Unit) {
  const first = getTimeDate(date, unit);
  const second = getTimeDate(that, unit);

  if (!first || !second) return false;
  return first >= second;
}

/**
 * 追加时间
 * @param date 目标
 * @param num 加的数
 * @param unit 单位
 */
export function addDate(date: DateType, num: number, unit: Unit) {
  const d = getDateInfo(date);
  if (!d) return null;

  let result: number;
  switch (unit) {
    case Unit.ms:
      result = d.date.setMilliseconds(d.ms + num);
      break;
    case Unit.s:
      result = d.date.setSeconds(d.s + num);
      break;
    case Unit.m:
      result = d.date.setMinutes(d.m + num);
      break;
    case Unit.h:
      result = d.date.setHours(d.h + num);
      break;
    case Unit.D:
      result = d.date.setDate(d.D + num);
      break;
    case Unit.M:
      result = d.date.setMonth(d.M + num);
      break;
    case Unit.Y:
      result = d.date.setFullYear(d.Y + num);
  }
  return new Date(result);
}
