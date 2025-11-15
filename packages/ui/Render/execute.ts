/**
 * 执行动态代码
 * @param body 代码字符串
 * @param data 数据源
 * @returns
 */
export function execute(body: string | undefined, data: Record<string, any>) {
  if (!body) return null;

  try {
    const func = new Function(...Object.keys(data), `return ${body};`);
    return func(...Object.values(data));
  } catch (error) {
    console.log(error);
  }
}

export function executeCode(body: string | undefined, data: Record<string, any>) {
  const value = body?.replace(/\$\{\s*([^}]+)\s*\}/g, (match: string, path: string) => {
    return execute(path, data);
  });

  if (value == null) return null;
  if (value == "true") return true;
  if (value == "false") return false;

  if (!isNaN(Number(value)) && value.trim() !== "") {
    return Number(value);
  }

  return value;
}
