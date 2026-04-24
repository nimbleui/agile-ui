// 导出词法分析模块
export { Lexer } from "./lexer/Lexer";
export { Token, TokenType } from "./lexer/Token";

// 导出语法分析模块
export { Parser } from "./parser/Parser";
export * from "./parser/AST";

// 导出运行时模块
export { Interpreter } from "./runtime/Interpreter";
export { ExecutionContext } from "./runtime/ExecutionContext";
export {
  FunctionRegistry,
  registerBuiltinFunctions,
  type IFunction,
  type FunctionSignature,
} from "./runtime/FunctionRegistry";

// 导出类型系统模块
export { TypeChecker, type TypeContext } from "./type-system/TypeChecker";
export { Types, type Type } from "./type-system/Types";

// 导出安全模块
export { Sandbox, type SandboxOptions } from "./security/Sandbox";
export { SyntaxFilter } from "./security/SyntaxFilter";

// 导出编译器和缓存模块
export { ExpressionCompiler, type CompileOptions } from "./compiler/ExpressionCompiler";
export { LRUCache } from "./cache/LRUCache";

// 便捷工厂函数：创建配置好的表达式引擎实例
import { FunctionRegistry, registerBuiltinFunctions } from "./runtime/FunctionRegistry";
import { ExpressionCompiler } from "./compiler/ExpressionCompiler";
import { ExecutionContext } from "./runtime/ExecutionContext";

/**
 * 创建一个预配置的表达式引擎实例
 * @param options 可选配置
 */
export function createExpressionEngine(options?: { allowedFunctions?: string[]; timeout?: number }) {
  // 创建函数注册表并注册内置函数
  const registry = new FunctionRegistry();
  registerBuiltinFunctions(registry);
  console.log(registry["functions"].keys());
  // 创建编译器
  const compiler = new ExpressionCompiler(registry, {
    allowedFunctions: options?.allowedFunctions,
    timeout: options?.timeout,
  });

  // 返回包含编译器和便捷创建上下文方法的对象
  return {
    compiler,
    registry,
    createContext: (vars: Record<string, unknown> = {}) => new ExecutionContext(vars, undefined, registry),
  };
}
