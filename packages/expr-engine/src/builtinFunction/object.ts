import { FunctionRegistry, IFunction } from "../runtime/FunctionRegistry";
import { Type, Types } from "../type-system/Types";

function createObjectFunction(
  name: string,
  paramTypes: Type[], // 第一个参数应为对象类型
  returnType: Type,
  fn: (obj: Record<string, unknown>, ...rest: unknown[]) => unknown,
): IFunction {
  return {
    name,
    signature: { paramTypes, returnType },
    execute(args: unknown[]): unknown {
      const [obj, ...rest] = args;
      if (typeof obj !== "object" || obj === null) {
        throw new Error(`${name}() expects an object as first argument`);
      }
      return fn(obj as Record<string, unknown>, ...rest);
    },
  };
}

export default function (registry: FunctionRegistry) {
  // 获取对象键名数组
  registry.register(
    createObjectFunction("objKeys", [Types.any], Types.arrayOf(Types.string), (obj) => Object.keys(obj)),
  );

  // 获取对象值数组
  registry.register(
    createObjectFunction("objValues", [Types.any], Types.arrayOf(Types.any), (obj) => Object.values(obj)),
  );

  // 检查是否包含某键
  registry.register(
    createObjectFunction("objHas", [Types.any, Types.string], Types.boolean, (obj, key) => {
      return Object.prototype.hasOwnProperty.call(obj, key as string);
    }),
  );

  // 安全取值（不存在返回 null）
  registry.register(
    createObjectFunction("objGet", [Types.any, Types.string], Types.any, (obj, key) => {
      const k = key as string;
      return k in obj ? obj[k] : null;
    }),
  );

  // 不可变设置属性（返回新对象）
  registry.register(
    createObjectFunction("objSet", [Types.any, Types.string, Types.any], Types.any, (obj, key, value) => {
      return { ...obj, [key as string]: value };
    }),
  );

  // 浅合并两个对象
  registry.register(
    createObjectFunction("objMerge", [Types.any, Types.any], Types.any, (obj, source) => {
      return { ...obj, ...(source as Record<string, any>) };
    }),
  );
}
