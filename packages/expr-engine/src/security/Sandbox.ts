import { ExecutionContext } from "../runtime/ExecutionContext";
import { Interpreter } from "../runtime/Interpreter";
import { Parser } from "../parser/Parser";
import { SyntaxFilter } from "./SyntaxFilter";
import { TypeChecker, TypeContext } from "../type-system/TypeChecker";
import { FunctionRegistry } from "../runtime/FunctionRegistry";
import { ASTNode } from "../parser/AST";
// import { LRUCache } from "../cache/LRUCache";
import { Type } from "../type-system/Types";

export interface SandboxOptions {
  timeout?: number;
  maxIterations?: number;
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
  private parser: Parser; // 保留以兼容旧的 execute(source) 方法

  constructor(functionRegistry: FunctionRegistry, options: SandboxOptions = {}) {
    this.syntaxFilter = new SyntaxFilter(options.allowedFunctions ?? Array.from(functionRegistry["functions"].keys()));
    this.typeChecker = new TypeChecker();
    this.functionRegistry = functionRegistry;
    this.parser = new Parser(); // 仅用于兼容旧接口
    this.options = {
      timeout: options.timeout ?? 5000,
      maxIterations: options.maxIterations ?? 100000,
      allowedFunctions: options.allowedFunctions ?? [],
    };
  }

  /**
   * 【推荐使用】对已编译的 AST 进行安全校验并超时执行
   * @param ast     已编译的 AST（可来自缓存）
   * @param context 执行上下文
   */
  async executeAST(ast: ASTNode, context: ExecutionContext): Promise<unknown> {
    // 1. AST 安全校验（深度限制、函数白名单）
    this.validateAST(ast);

    // 2. 类型检查（可选，用于未来扩展）
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

    // 3. 超时执行
    return this.executeWithTimeout(ast, context);
  }

  /**
   * 【兼容旧接口】从源码执行，内部会走 ExpressionCompiler 的缓存（若传入）
   * 实际上直接调用此方法不会自动缓存，建议外部统一使用 ExpressionCompiler.execute()
   */
  async execute(source: string, context: ExecutionContext): Promise<unknown> {
    // 此方法保留是为了向后兼容，内部仍然做过滤、解析、校验、执行
    this.syntaxFilter.validate(source);
    const ast = this.parser.parse(source);
    return this.executeAST(ast, context);
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
