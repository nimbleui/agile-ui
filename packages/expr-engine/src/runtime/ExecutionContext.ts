import { FunctionRegistry } from "./FunctionRegistry";

/**
 * 执行上下文
 * 管理变量作用域和函数注册表
 * 支持嵌套作用域（链式查找）
 */
export class ExecutionContext {
  private variables: Map<string, unknown>; // 当前作用域的变量映射
  private parent?: ExecutionContext; // 父作用域（用于链式查找）
  public readonly functions: FunctionRegistry; // 函数注册表

  /**
   * @param variables 初始变量
   * @param parent 父上下文
   * @param functions 函数注册表（可选，若不传则使用新实例）
   */
  constructor(variables: Record<string, unknown> = {}, parent?: ExecutionContext, functions?: FunctionRegistry) {
    this.variables = new Map(Object.entries(variables));
    this.parent = parent;
    this.functions = functions ?? new FunctionRegistry();
  }

  /**
   * 获取变量值，优先从当前作用域查找，若未找到则向上查找父作用域
   */
  get(name: string): unknown {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    return undefined;
  }

  /**
   * 在当前作用域设置变量值
   */
  set(name: string, value: unknown): void {
    this.variables.set(name, value);
  }

  /**
   * 检查变量是否存在于当前或父作用域
   */
  has(name: string): boolean {
    return this.variables.has(name) || (this.parent?.has(name) ?? false);
  }

  /**
   * 创建子作用域，用于函数调用或代码块
   * @param variables 子作用域的局部变量
   */
  createChild(variables: Record<string, unknown> = {}): ExecutionContext {
    return new ExecutionContext(variables, this, this.functions);
  }
}
