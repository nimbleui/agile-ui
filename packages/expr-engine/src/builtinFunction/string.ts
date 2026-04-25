import { FunctionRegistry, IFunction } from "../runtime/FunctionRegistry";
import { Type, Types } from "../type-system/Types";

function createStringFunction(
  name: string,
  paramTypes: Type[],
  returnType: Type,
  fn: (str: string, ...rest: any[]) => unknown,
): IFunction {
  return {
    name,
    signature: { paramTypes, returnType },
    execute(args: unknown[]): unknown {
      const [maybeStr, ...rest] = args;
      // 确保第一个参数是字符串（允许 undefined/null ？这里严格要求）
      if (typeof maybeStr !== "string") {
        throw new Error(`${name}() expects a string as the first argument`);
      }
      return fn(maybeStr, ...rest);
    },
  };
}

export default function (registry: FunctionRegistry) {
  // 转大写
  registry.register(createStringFunction("toUpper", [Types.string], Types.string, (str) => str.toUpperCase()));

  // 转小写
  registry.register(createStringFunction("toLower", [Types.string], Types.string, (str) => str.toLowerCase()));

  // 去除首尾空白
  registry.register(createStringFunction("trim", [Types.string], Types.string, (str) => str.trim()));

  // 获取子串 substring(str, start, end?)  - 模仿 JS 的 substring
  registry.register(
    createStringFunction(
      "substring",
      [Types.string, Types.number, Types.number], // end 可选，但签名中标注为 number 也行
      Types.string,
      (str, start: number, end?: number) => {
        if (end !== undefined) {
          return str.substring(start, end);
        }
        return str.substring(start);
      },
    ),
  );

  // 替换第一个匹配
  registry.register(
    createStringFunction(
      "replace",
      [Types.string, Types.string, Types.string],
      Types.string,
      (str, search: string, replacement: string) => str.replace(search, replacement),
    ),
  );

  // 分割字符串
  registry.register(
    createStringFunction("split", [Types.string, Types.string], Types.arrayOf(Types.string), (str, separator: string) =>
      str.split(separator),
    ),
  );

  // 拼接字符串
  registry.register(createStringFunction("concat", [Types.string], Types.string, (...args) => args.join("")));

  // 检查是否包含某些字符串
  registry.register(
    createStringFunction("contains", [Types.string, Types.string], Types.boolean, (str, val) => str.includes(val)),
  );

  // 获取数组和字符串的长度
  registry.register(
    createStringFunction("length", [Types.any], Types.number, (str) => {
      if (Array.isArray(str) || typeof str == "string") {
        return str.length;
      }
      return 0;
    }),
  );

  // 检查是否以某字符串开头
  registry.register(
    createStringFunction("startsWith", [Types.string, Types.string], Types.boolean, (str, prefix: string) =>
      str.startsWith(prefix),
    ),
  );

  // 检查是否以某字符串结尾
  registry.register(
    createStringFunction("endsWith", [Types.string, Types.string], Types.boolean, (str, suffix: string) =>
      str.endsWith(suffix),
    ),
  );

  // 字符索引
  registry.register(
    createStringFunction("charAt", [Types.string, Types.number], Types.string, (str, index: number) =>
      str.charAt(index),
    ),
  );
}
