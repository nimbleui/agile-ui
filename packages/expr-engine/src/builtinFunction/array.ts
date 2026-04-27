import { ExecutionContext } from "../runtime/ExecutionContext";
import { FunctionRegistry, IFunction } from "../runtime/FunctionRegistry";
import { Types } from "../type-system/Types";

// 辅助函数：解析第二个参数，返回真正的可执行函数
function resolveIteratee(arg: unknown, ctx: ExecutionContext): IFunction {
  let iteratee = arg;
  if (typeof iteratee === "string") {
    iteratee = ctx.functions.get(iteratee);
    if (!iteratee) {
      throw new Error(`Function "${arg}" not found`);
    }
  }
  if (typeof iteratee !== "object" || !(iteratee as IFunction).execute) {
    throw new Error("Iteratee must be a function name or lambda");
  }
  return iteratee as IFunction;
}

// 工厂函数：生成一个数组高阶函数（如 filter, map, find 等）
function createArrayIterateeFunction(
  name: string,
  nativeMethod: "filter" | "map" | "some" | "every" | "find" | "findIndex",
  desc: string,
): IFunction {
  return {
    name,
    description: desc,
    signature: {
      paramTypes: [Types.arrayOf(Types.any), Types.func([Types.any], Types.any)],
      returnType: Types.arrayOf(Types.any), // 简单起见，返回 any 数组；有些方法返回单个元素，但可稍后细化
    },
    execute(args: unknown[], ctx: ExecutionContext): unknown {
      const arr = args[0] as unknown[];
      const fn = resolveIteratee(args[1], ctx);

      // 使用原生数组方法，将每个元素通过 fn.execute 处理
      const result = (arr as any)[nativeMethod]((item: unknown, index: number, array: unknown[]) => {
        // 为了模拟原生方法，传递 [item, index, array] 作为参数？这里我们简单传递 item
        // 但对于 map，只需要 item；对于 filter，只需要 item；为了统一，传递 item
        // 如果需要 index 和 array，可扩展 Lambda 参数
        return fn.execute([item, index, array], ctx);
      });

      return result;
    },
  };
}

export default function (registry: FunctionRegistry) {
  registry.register(createArrayIterateeFunction("arrMap", "map", "映射一份新的数组"));
  registry.register(createArrayIterateeFunction("arrFind", "find", "查找数组满足条件的一个元素"));
  registry.register(createArrayIterateeFunction("arrFindIndex", "findIndex", "查找数组满足条件的一个元素的索引"));
  registry.register(createArrayIterateeFunction("arrSome", "some", "数组中是否至少有一个元素通过"));
  registry.register(createArrayIterateeFunction("arrEvery", "every", "数组内的所有元素是否都能通过"));
  registry.register(createArrayIterateeFunction("arrFilter", "filter", "过滤满足添加的元素"));
}
