import {formatDate} from '.';

export enum FORMAT_TYPE {
  'date' = 'YYYY-MM-DD',
  'datetime' = 'YYYY-MM-DD hh:mm:ss',
  'weight' = 'weight',
}

/**
 * 格式化
 * @param value 目标
 * @param type 类型：date、datetime、weight
 */
export function format(value: any, type: FORMAT_TYPE) {
  let result: string | null = value;

  if (FORMAT_TYPE.date == type || FORMAT_TYPE.datetime == type) {
    result = formatDate(value, type);
  }

  if (FORMAT_TYPE.weight == type) {
    result = '';
  }

  return result ?? '-';
}
