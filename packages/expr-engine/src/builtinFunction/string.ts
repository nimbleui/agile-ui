import { FunctionRegistry, IFunction } from "../runtime/FunctionRegistry";
import { Type, Types } from "../type-system/Types";

function createStringFunction(
  name: string,
  paramTypes: Type[],
  returnType: Type,
  fn: (str: string, ...rest: any[]) => unknown,
  desc: string,
): IFunction {
  return {
    name,
    description: desc,
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
  registry.register(
    createStringFunction("srtToUpper", [Types.string], Types.string, (str) => str.toUpperCase(), "转大写"),
  );

  registry.register(
    createStringFunction("srtToLower", [Types.string], Types.string, (str) => str.toLowerCase(), "转小写"),
  );

  registry.register(createStringFunction("srtTrim", [Types.string], Types.string, (str) => str.trim(), "去除首尾空白"));

  registry.register(
    createStringFunction(
      "srtSubstring",
      [Types.string, Types.number, Types.number], // end 可选，但签名中标注为 number 也行
      Types.string,
      (str, start: number, end?: number) => {
        if (end !== undefined) {
          return str.substring(start, end);
        }
        return str.substring(start);
      },
      "获取子串 substring(str, start, end?)  - 模仿 JS 的 substring",
    ),
  );

  registry.register(
    createStringFunction(
      "srtReplace",
      [Types.string, Types.string, Types.string],
      Types.string,
      (str, search: string, replacement: string) => str.replace(search, replacement),
      "替换第一个匹配",
    ),
  );

  registry.register(
    createStringFunction(
      "srtSplit",
      [Types.string, Types.string],
      Types.arrayOf(Types.string),
      (str, separator: string) => str.split(separator),
      "分割字符串",
    ),
  );

  registry.register(
    createStringFunction("srtConcat", [Types.string], Types.string, (...args) => args.join(""), "拼接字符串"),
  );

  registry.register(
    createStringFunction(
      "srtContains",
      [Types.string, Types.string],
      Types.boolean,
      (str, val) => str.includes(val),
      "检查是否包含某些字符串",
    ),
  );

  registry.register(
    createStringFunction(
      "length",
      [Types.any],
      Types.number,
      (str) => {
        if (Array.isArray(str) || typeof str == "string") {
          return str.length;
        }
        return 0;
      },
      "获取数组和字符串的长度",
    ),
  );

  registry.register(
    createStringFunction(
      "srtStartsWith",
      [Types.string, Types.string],
      Types.boolean,
      (str, prefix: string) => str.startsWith(prefix),
      "检查是否以某字符串开头",
    ),
  );

  registry.register(
    createStringFunction(
      "srtEndsWith",
      [Types.string, Types.string],
      Types.boolean,
      (str, suffix: string) => str.endsWith(suffix),
      "检查是否以某字符串结尾",
    ),
  );

  registry.register(
    createStringFunction(
      "srtCharAt",
      [Types.string, Types.number],
      Types.string,
      (str, index: number) => str.charAt(index),
      "字符索引",
    ),
  );

  registry.register({
    name: "toString",
    description: "转成字符串",
    signature: { paramTypes: [Types.any], returnType: Types.string },
    execute: (str: any) => String(str),
  });
}
