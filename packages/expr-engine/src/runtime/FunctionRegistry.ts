import { Type, Types } from "../type-system/Types";
import { ExecutionContext } from "./ExecutionContext";

/**
 * 函数签名定义
 */
export interface FunctionSignature {
  paramTypes: Type[]; // 参数类型列表
  returnType: Type; // 返回值类型
  variadic?: boolean; // 是否支持可变参数
}

/**
 * 可执行函数接口
 */
export interface IFunction {
  name: string; // 函数名
  signature: FunctionSignature; // 函数签名
  execute(args: unknown[], context: ExecutionContext): unknown; // 执行函数
}

/**
 * 函数注册表，管理所有可用函数
 */
export class FunctionRegistry {
  private functions: Map<string, IFunction> = new Map(); // 函数名到函数对象的映射

  /**
   * 注册一个函数
   */
  register(fn: IFunction): void {
    this.functions.set(fn.name, fn);
  }

  /**
   * 根据名称获取函数
   */
  get(name: string): IFunction | undefined {
    return this.functions.get(name);
  }

  /**
   * 判断函数是否存在
   */
  has(name: string): boolean {
    return this.functions.has(name);
  }

  /**
   * 获取函数的返回类型（用于类型检查）
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getReturnType(name: string, argTypes: Type[]): Type | undefined {
    const fn = this.functions.get(name);
    if (!fn) return undefined;
    // 此处可添加参数类型检查逻辑，简化实现直接返回声明的返回类型
    return fn.signature.returnType;
  }
}

/**
 * 注册内置函数到注册表
 */
export function registerBuiltinFunctions(registry: FunctionRegistry): void {
  // ========== 数学函数 ==========
  registry.register({
    name: "abs",
    signature: { paramTypes: [Types.number], returnType: Types.number },
    execute: (args) => Math.abs(args[0] as number),
  });

  registry.register({
    name: "max",
    signature: { paramTypes: [Types.number], returnType: Types.number, variadic: true },
    execute: (args) => Math.max(...(args as number[])),
  });

  registry.register({
    name: "min",
    signature: { paramTypes: [Types.number], returnType: Types.number, variadic: true },
    execute: (args) => Math.min(...(args as number[])),
  });

  // ========== 字符串函数 ==========
  registry.register({
    name: "concat",
    signature: { paramTypes: [Types.string], returnType: Types.string, variadic: true },
    execute: (args) => (args as string[]).join(""),
  });

  registry.register({
    name: "contains",
    signature: { paramTypes: [Types.string, Types.string], returnType: Types.boolean },
    execute: (args) => (args[0] as string).includes(args[1] as string),
  });

  registry.register({
    name: "length",
    signature: { paramTypes: [Types.any], returnType: Types.number },
    execute: (args) => {
      const val = args[0];
      if (typeof val === "string" || Array.isArray(val)) return val.length;
      return 0;
    },
  });

  // ========== 数组函数 ==========
  registry.register({
    name: "map",
    signature: {
      paramTypes: [Types.arrayOf(Types.any), Types.func([Types.any], Types.any)],
      returnType: Types.arrayOf(Types.any),
    },
    execute: (args, ctx) => {
      const arr = args[0] as unknown[];
      const fn = args[1] as IFunction; // 高阶函数，参数是一个函数
      return arr.map((item) => fn.execute([item], ctx));
    },
  });

  registry.register({
    name: "filter",
    signature: {
      paramTypes: [Types.arrayOf(Types.any), Types.func([Types.any], Types.boolean)],
      returnType: Types.arrayOf(Types.any),
    },
    execute: (args, ctx) => {
      const arr = args[0] as unknown[];
      const fn = args[1] as IFunction;
      return arr.filter((item) => fn.execute([item], ctx));
    },
  });
}
