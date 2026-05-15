import { createExpressionEngine, ExecutionContext } from "@agile-ui/expr-engine";

const regex = /\{\{(.+?)\}\}/g;

export function handleExpression() {
  const engine = createExpressionEngine({
    timeout: 5000,
  });

  const getValue = (str: any, context: ExecutionContext) => {
    if (typeof str != "string") return str;

    const contents = [...str.matchAll(regex)].map((m) => m[1]);
    if (!contents.length) return str;

    if (contents.length == 1 && contents[0].length == str.length - 4) {
      return engine.compiler.evaluateSync(contents[0], context);
    }

    return str.replace(regex, (match, varPath: string) => {
      const trimmedPath = varPath.trim();
      const value = engine.compiler.evaluateSync(trimmedPath, context);
      // 如果未找到变量，保留原样（或替换为空，这里保留以便调试）
      return value !== undefined ? String(value) : match;
    });
  };

  const createResolve = (scope: Record<string, any>) => {
    const context = engine.createContext(scope);

    return {
      evaluate: <T>(expr: string) => {
        return getValue(expr, context) as T;
      },
      evaluateObj: <T extends Record<string, any>>(obj: T) => {
        const result = {} as { [key in keyof T]: any };
        for (const [key, val] of Object.entries(obj)) {
          result[key as keyof T] = getValue(val, context);
        }

        return result;
      },
    };
  };

  return createResolve;
}
