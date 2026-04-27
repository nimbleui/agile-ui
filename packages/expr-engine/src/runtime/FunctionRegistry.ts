import { Type, Types } from "../type-system/Types";
import { ExecutionContext } from "./ExecutionContext";
import builtinFunction from "../builtinFunction";

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
  description: string; // 描述
  signature: FunctionSignature; // 函数签名
  execute(args: unknown[], context: ExecutionContext): unknown; // 执行函数
}

/**
 * 函数注册表，管理所有可用函数
 */
export class FunctionRegistry {
  private functions: Map<string, IFunction> = new Map(); // 函数名到函数对象的映射
  private parent?: FunctionRegistry; // 新增：父注册表

  constructor(parent?: FunctionRegistry) {
    this.parent = parent;
  }

  /**
   * 注册一个函数
   */
  register(fn: IFunction, options?: { overwrite?: boolean }): void {
    const allowOverwrite = options?.overwrite !== false;
    if (this.functions.has(fn.name)) {
      if (!allowOverwrite) {
        throw new Error(`Function "${fn.name}" already exists and overwrite is disabled.`);
      }
      console.warn(`[FunctionRegistry] Function "${fn.name}" already registered. Overwriting.`);
    }
    this.functions.set(fn.name, fn);
  }

  /**
   * 根据名称获取函数
   */
  get(name: string): IFunction | undefined {
    const fn = this.functions.get(name);
    if (fn) return fn;
    return this.parent?.get(name); // 级联查找
  }

  /**
   * 判断函数是否存在
   */
  has(name: string): boolean {
    return this.functions.has(name) || (this.parent?.has(name) ?? false);
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

  /** 获取当前注册表直接拥有的函数名列表（不含父级） */
  getOwnNames(): string[] {
    return Array.from(this.functions.keys());
  }

  /**
   * 从当前注册表中移除指定函数（不影响父注册表）
   */
  remove(name: string): boolean {
    return this.functions.delete(name);
  }
}

/**
 * 注册内置函数到注册表
 */
export function registerBuiltinFunctions(registry: FunctionRegistry): void {
  // ========== 数学函数 ==========
  registry.register({
    name: "abs",
    description: "绝对值",
    signature: { paramTypes: [Types.number], returnType: Types.number },
    execute: (args) => Math.abs(args[0] as number),
  });

  registry.register({
    name: "max",
    description: "参数中的最大值",
    signature: { paramTypes: [Types.number], returnType: Types.number, variadic: true },
    execute: (args) => Math.max(...(args as number[])),
  });

  registry.register({
    name: "min",
    description: "参数中的最小值",
    signature: { paramTypes: [Types.number], returnType: Types.number, variadic: true },
    execute: (args) => Math.min(...(args as number[])),
  });

  // 注册方法
  builtinFunction(registry);
}
