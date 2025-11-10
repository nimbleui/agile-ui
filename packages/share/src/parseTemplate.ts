import { getValue } from "./getValue";

const REGEX = /\{\{(.*?)\}\}/g;

function evaluate(data: Record<string, any>, expression: string) {
  try {
    const functionBody = `return (${expression})`;
    const func = new Function('data', functionBody);
    return func(data);
  } catch (error) {
    // 回退到简单属性访问
    return getValue(data, expression);
  }
}

export function parse(data: Record<string, any>,template: string): string {
  return template.replace(REGEX, (match, expression) => {
    try {
      const trimmedExpression = expression.trim();
      if (!trimmedExpression) return '';
      
      const result = evaluate(data, trimmedExpression);
      return String(result ?? '');
    } catch (error) {
      console.warn(`表达式解析错误: ${expression}`, error);
      return match;
    }
  });
};
