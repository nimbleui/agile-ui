import { Parser } from "../parser/Parser";
import { ASTNode } from "../parser/AST";
import { ExecutionContext } from "../runtime/ExecutionContext";
import { Interpreter } from "../runtime/Interpreter";
import { Sandbox } from "../security/Sandbox";
import { LRUCache } from "../cache/LRUCache";
import { FunctionRegistry } from "../runtime/FunctionRegistry";

export interface CompileOptions {
  cache?: boolean; // 是否使用缓存（默认 true）
  sandbox?: boolean; // 是否使用沙箱（默认 true）
  allowedFunctions?: string[];
  timeout?: number;
}

/**
 * 表达式编译器（统一入口）
 * 整合了缓存、安全过滤、沙箱执行
 */
export class ExpressionCompiler {
  private parser: Parser;
  private sandbox: Sandbox;
  private astCache: LRUCache<string, ASTNode>;
  private functionRegistry: FunctionRegistry;

  constructor(functionRegistry: FunctionRegistry, options: CompileOptions = {}) {
    this.parser = new Parser();
    this.functionRegistry = functionRegistry;
    // 初始化沙箱（内部持有语法过滤器和 AST 校验逻辑）
    this.sandbox = new Sandbox(functionRegistry, {
      timeout: options.timeout,
      allowedFunctions: options.allowedFunctions,
    });
    // 初始化 LRU 缓存，容量 1000
    this.astCache = new LRUCache(1000);
  }

  /**
   * 编译源代码为 AST（带缓存）
   * 此方法不包含安全过滤，纯编译
   */
  compile(source: string): ASTNode {
    if (this.astCache.has(source)) {
      return this.astCache.get(source)!;
    }
    const ast = this.parser.parse(source);
    this.astCache.set(source, ast);
    return ast;
  }

  /**
   * 异步执行表达式（推荐方式）
   * @param source   表达式源码
   * @param context  执行上下文
   * @param options  编译选项（可覆盖实例化时的默认值）
   */
  async execute(source: string, context: ExecutionContext, options: CompileOptions = {}): Promise<unknown> {
    // 确定本次执行的配置
    const useSandbox = options.sandbox !== false; // 默认 true
    const useCache = options.cache !== false; // 默认 true

    // 获取 AST（利用缓存）
    const ast = useCache ? this.compile(source) : this.parser.parse(source);

    // ========== 沙箱模式（默认）==========
    if (useSandbox) {
      // 语法层过滤（检查危险模式）
      this.sandbox.syntaxFilter.validate(source);

      // 执行（内部会进行 AST 校验 + 超时保护）
      return this.sandbox.executeAST(ast, context);
    }

    // ========== 非沙箱模式（调试/内部可信场景）==========
    const interpreter = new Interpreter(context);
    return interpreter.evaluate(ast);
  }

  /**
   * 同步执行表达式（跳过沙箱，不建议生产环境使用）
   */
  evaluateSync(source: string, context: ExecutionContext): unknown {
    const ast = this.compile(source);
    const interpreter = new Interpreter(context);
    return interpreter.evaluate(ast);
  }

  /**
   * 清空 AST 缓存
   */
  clearCache(): void {
    this.astCache.clear();
  }
}
