/**
 * 将驼峰命名字符串分割为单词数组
 * @param {string} camelCaseStr 驼峰命名的字符串
 * @returns {string[]} 分割后的单词数组
 */
export function splitCamelCase(camelCaseStr: string) {
  // 处理空字符串或非字符串输入
  if (typeof camelCaseStr !== 'string' || camelCaseStr.length === 0) {
    return [];
  }

  // 使用正则表达式匹配大写字母前的位置或数字后的位置
  return camelCaseStr
    .replace(/([a-z])([A-Z])/g, '$1 $2') // 在小写和大写字母间插入空格
    .split(/\s+/); // 按空格分割成数组
}

/**
 * 把大驼峰转成分隔符的形式拼接
 * @param str 目标
 * @param pla 分隔符
 * @returns
 */
export function getKebabCase(str: string, pla = '-') {
  return str.replace(/([a-z])([A-Z0-9])/g, `$1${pla}$2`).toLowerCase();
}
