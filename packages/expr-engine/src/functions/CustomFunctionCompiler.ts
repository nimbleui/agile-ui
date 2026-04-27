import { IFunction, FunctionSignature } from "../runtime/FunctionRegistry";
import { CustomFunctionDef } from "./CustomFunctionDef";
import { ExecutionContext } from "../runtime/ExecutionContext";
import { Parser } from "../parser/Parser";
import { Type } from "../type-system/Types";
import { Sandbox } from "../security/Sandbox";

/**
 * 自定义函数编译器
 * 将用户配置的 CustomFunctionDef 编译为可执行的 IFunction，
 * 编译过程复用表达式引擎的解析与安全沙箱。
 */
export class CustomFunctionCompiler {
  private parser: Parser;
  private sandbox: Sandbox;

  constructor(sandbox: Sandbox) {
    this.parser = new Parser();
    this.sandbox = sandbox;
  }

  /**
   * 编译自定义函数定义，返回可执行的 IFunction 实例。
   * @param def  用户定义的函数配置（ID、参数、表达式体等）
   */
  compile(def: CustomFunctionDef): IFunction {
    // 1. 安全过滤：函数体不得包含危险模式
    this.sandbox.syntaxFilter.validate(def.body);

    // 2. 解析函数体为 AST（每次编译均解析，无额外缓存；重复编译由上层管理器控制）
    const bodyAST = this.parser.parse(def.body);

    // 3. 构建类型签名（供 TypeChecker 使用）
    const paramTypes: Type[] = def.params.map((p) => p.type ?? "any");
    const signature: FunctionSignature = {
      paramTypes,
      returnType: def.returnType ?? "any",
    };

    // 4. 创建执行闭包（捕获 def 和 bodyAST，绑定参数后通过沙箱安全执行）
    const execute = (args: unknown[], ctx: ExecutionContext): unknown => {
      // 4.1 为参数创建局部变量区，实参与形参绑定
      const localVars: Record<string, unknown> = {};
      def.params.forEach((param, index) => {
        let value = args[index];
        // 若参数未传递且定义了默认值，则计算默认值
        if (value === undefined && param.default !== undefined) {
          value = this.evaluateDefault(param.default, ctx);
        }
        localVars[param.name] = value;
      });

      // 4.2 创建子上下文，注入参数变量
      const localContext = ctx.createChild(localVars);

      // 4.3 通过沙箱同步安全执行函数体 AST（包含深度限制与函数白名单检查）
      return this.sandbox.executeASTSync(bodyAST, localContext);
    };

    return { name: def.name, signature, execute };
  }

  /**
   * 计算参数默认值。
   * 默认值可以是简单字面量（数字、字符串）或一个表达式，后者会通过沙箱安全求值。
   */
  private evaluateDefault(defaultExpr: string, ctx: ExecutionContext): unknown {
    // 简单字面量直接返回，避免解析开销
    if (/^-?\d+(\.\d+)?$/.test(defaultExpr)) return parseFloat(defaultExpr);
    if (defaultExpr.startsWith('"') || defaultExpr.startsWith("'")) {
      return defaultExpr.slice(1, -1);
    }

    // 复杂表达式：先过滤、解析、再通过沙箱执行
    this.sandbox.syntaxFilter.validate(defaultExpr);
    const ast = this.parser.parse(defaultExpr);
    return this.sandbox.executeASTSync(ast, ctx);
  }
}
