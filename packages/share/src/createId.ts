const count = Math.floor(Math.random() * 1000000);
let current = 0;

/**
 * 生成id
 * @param prefix 前缀
 * @returns
 */
export function createId(prefix = 'id') {
  return `${prefix}-${count}-${current++}`;
}

/**
 * 简单生成UUID
 * @param {*} length
 * @param {*} option
 * @returns
 */
export const genUuid = (
  length = 8,
  option: {isNumber?: boolean; prefix?: string} = {}
) => {
  const {isNumber = false, prefix = ''} = option;
  let id = '';
  const numberValue = '0123456789';
  const letterValue = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
  // let numberValueLen = numberValue.length;

  const characters = isNumber ? numberValue : numberValue + letterValue;

  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    id += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return isNumber ? Number(id) : prefix ? prefix + id : id;
};

// 按规则生成指定长度的随机数
export function getRandom(pattern = 'xxxxx-xxxxx-xxxxx-xxxxx') {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return pattern.replace(/x/g, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  );
}
