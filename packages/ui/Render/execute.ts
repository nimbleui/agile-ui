/**
 * 执行动态代码
 * @param body 代码字符串
 * @param data 数据源
 * @returns
 */
export function execute(body: string | undefined, data: Record<string, any>) {
  if (!body) return null;

  const match = body.match(/\$\{\s*([^}]+)\s*\}/);
  if (!match) return body;
  try {
    const func = new Function(...Object.keys(data), `return ${match[1]};`);
    return func(...Object.values(data));
  } catch (error) {
    console.log(error);
  }
}

export function executeCode(body: string | undefined, data: Record<string, any>) {
  return body?.replace(/\$\{\s*([^}]+)\s*\}/g, (match: string, path: string) => {
    return execute(path, data);
  });
}
