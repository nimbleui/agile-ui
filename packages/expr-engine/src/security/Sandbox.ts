import { ExecutionContext } from "../runtime/ExecutionContext";
import { Interpreter } from "../runtime/Interpreter";
import { SyntaxFilter } from "./SyntaxFilter";
import { TypeChecker, TypeContext } from "../type-system/TypeChecker";
import { FunctionRegistry } from "../runtime/FunctionRegistry";
import { ASTNode } from "../parser/AST";
// import { LRUCache } from "../cache/LRUCache";
import { Type } from "../type-system/Types";

export interface SandboxOptions {
  /** 超时时间 */
  timeout?: number;
  /** 最大数量 */
  maxIterations?: number;
  /** 白名单 */
  allowedFunctions?: string[];
}

/**
 * 安全沙箱
 * 提供 AST 校验 + 超时执行
 * 不再负责词法/语法解析，解析与缓存由 ExpressionCompiler 统一管理
 */
export class Sandbox {
  public readonly syntaxFilter: SyntaxFilter; // 公开以便外部进行语法过滤
  private typeChecker: TypeChecker;
  private functionRegistry: FunctionRegistry;
  private options: Required<SandboxOptions>;

  constructor(functionRegistry: FunctionRegistry, options: SandboxOptions = {}) {
    this.functionRegistry = functionRegistry;

    // 确定函数允许检查器
    let allowChecker: (name: string) => boolean;
    if (options.allowedFunctions) {
      const set = new Set(options.allowedFunctions);
      allowChecker = (name) => set.has(name);
    } else {
      // 动态查询注册表，保证新注册的函数自动生效
      allowChecker = (name) => this.functionRegistry.has(name);
    }

    this.syntaxFilter = new SyntaxFilter(allowChecker);
    this.typeChecker = new TypeChecker();
    this.options = {
      timeout: options.timeout ?? 5000,
      maxIterations: options.maxIterations ?? 100000,
      allowedFunctions: options.allowedFunctions ?? [],
    };
  }

  /**
   * 执行安全校验与类型推导
   */
  private validateAndInfer(ast: ASTNode, context: ExecutionContext): void {
    // 1. AST 结构安全校验
    this.validateAST(ast);

    // 2. 类型检查（可选）
    const typeContext: TypeContext = {
      getVariableType: (name) => {
        const val = context.get(name);
        return this.valueToType(val);
      },
      getFunctionReturnType: (name, argTypes) => {
        return this.functionRegistry.getReturnType(name, argTypes);
      },
    };
    this.typeChecker.infer(ast, typeContext);
  }

  /**
   * 对已编译的 AST 进行安全校验并同步执行（无超时控制）
   * 适用于自定义函数内部调用，安全校验包括：
   * - AST 深度限制
   * - 函数白名单检查
   * - 类型推导（若启用）
   */
  executeASTSync(ast: ASTNode, context: ExecutionContext): unknown {
    // 校验逻辑
    this.validateAndInfer(ast, context);

    // 3. 直接解释执行（无超时，依赖外部沙箱）
    const interpreter = new Interpreter(context);
    return interpreter.evaluate(ast);
  }

  /**
   * 【推荐使用】对已编译的 AST 进行安全校验并超时执行
   * @param ast     已编译的 AST（可来自缓存）
   * @param context 执行上下文
   */
  async executeAST(ast: ASTNode, context: ExecutionContext): Promise<unknown> {
    // 校验逻辑
    this.validateAndInfer(ast, context);

    // 3. 超时执行
    return this.executeWithTimeout(ast, context);
  }

  // ========== 以下为私有方法，与之前实现一致 ==========
  private validateAST(node: ASTNode, depth: number = 0): void {
    const MAX_DEPTH = 50;
    if (depth > MAX_DEPTH) {
      throw new Error(`AST depth exceeds limit (${MAX_DEPTH})`);
    }
    switch (node.type) {
      case "BinaryExpression":
      case "LogicalExpression":
        this.validateAST(node.left, depth + 1);
        this.validateAST(node.right, depth + 1);
        break;
      case "UnaryExpression":
        this.validateAST(node.argument, depth + 1);
        break;
      case "CallExpression":
        if (!this.syntaxFilter.isFunctionAllowed(node.callee)) {
          throw new Error(`Function not allowed: ${node.callee}`);
        }
        node.arguments.forEach((arg) => this.validateAST(arg, depth + 1));
        break;
      case "MemberExpression":
        this.validateAST(node.object, depth + 1);
        break;
      case "IndexExpression":
        this.validateAST(node.object, depth + 1);
        this.validateAST(node.index, depth + 1);
        break;
      case "ConditionalExpression":
        this.validateAST(node.test, depth + 1);
        this.validateAST(node.consequent, depth + 1);
        this.validateAST(node.alternate, depth + 1);
        break;
      case "ArrayExpression":
        node.elements.forEach((el) => this.validateAST(el, depth + 1));
        break;
      case "ObjectExpression":
        node.properties.forEach((prop) => this.validateAST(prop.value, depth + 1));
        break;
    }
  }

  /**
   * 带超时的解释器执行
   */
  private executeWithTimeout(ast: ASTNode, context: ExecutionContext): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const interpreter = new Interpreter(context);
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout (${this.options.timeout}ms)`));
      }, this.options.timeout);

      try {
        const result = interpreter.evaluate(ast);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private valueToType(value: unknown): Type {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "number") return "number";
    if (typeof value === "string") return "string";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return { kind: "array", elementType: "any" };
    if (typeof value === "object") return { kind: "object", properties: new Map() };
    return "any";
  }
}
