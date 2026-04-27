import { ASTNode, ASTVisitor, LambdaExpressionNode } from "../parser/AST";
import { ExecutionContext } from "./ExecutionContext";
import { IFunction } from "./FunctionRegistry";
// import { IFunction } from "./FunctionRegistry";

/**
 * 表达式解释器
 * 继承自 ASTVisitor，遍历 AST 并执行计算
 */
export class Interpreter extends ASTVisitor<unknown> {
  private context: ExecutionContext; // 当前执行上下文

  constructor(context: ExecutionContext) {
    super();
    this.context = context;
  }

  /**
   * 对 AST 进行求值
   */
  evaluate(node: ASTNode): unknown {
    return this.visit(node);
  }

  // ========== 重写各节点的访问方法 ==========

  override visitLiteral(node: any): unknown {
    return node.value; // 直接返回字面量值
  }

  override visitIdentifier(node: any): unknown {
    const value = this.context.get(node.name);
    if (value === undefined) {
      throw new Error(`Undefined variable: ${node.name}`);
    }
    return value;
  }

  override visitUnaryExpression(node: any): unknown {
    const arg = this.visit(node.argument);
    switch (node.operator) {
      case "!":
      case "not":
        return !arg; // 逻辑非
      case "-":
        return -(arg as number); // 数值取负
      default:
        throw new Error(`Unknown unary operator: ${node.operator}`);
    }
  }

  override visitBinaryExpression(node: any): unknown {
    const left = this.visit(node.left);
    const right = this.visit(node.right);
    switch (node.operator) {
      case "+":
        return (left as any) + (right as any);
      case "-":
        return (left as number) - (right as number);
      case "*":
        return (left as number) * (right as number);
      case "/":
        return (left as number) / (right as number);
      case "%":
        return (left as number) % (right as number);
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case ">":
        return (left as number) > (right as number);
      case "<":
        return (left as number) < (right as number);
      case ">=":
        return (left as number) >= (right as number);
      case "<=":
        return (left as number) <= (right as number);
      default:
        throw new Error(`Unknown binary operator: ${node.operator}`);
    }
  }

  override visitLogicalExpression(node: any): unknown {
    const left = this.visit(node.left);
    // 短路求值
    if (node.operator === "&&" || node.operator === "and") {
      if (!left) return false; // 左值为假，短路返回 false
      return !!this.visit(node.right); // 计算右值并转为布尔
    } else {
      // '||' 或 'or'
      if (left) return true; // 左值为真，短路返回 true
      return !!this.visit(node.right);
    }
  }

  override visitCallExpression(node: any): unknown {
    const func = this.context.functions.get(node.callee);
    if (!func) {
      throw new Error(`Function not found: ${node.callee}`);
    }
    // 计算所有参数
    const args = node.arguments.map((arg: ASTNode) => this.visit(arg));
    // 调用函数，传入执行上下文
    return func.execute(args, this.context);
  }

  override visitMemberExpression(node: any): unknown {
    const obj = this.visit(node.object) as Record<string, unknown>;
    if (obj === null || obj === undefined) {
      throw new Error(`Cannot read property '${node.property}' of ${obj}`);
    }
    return obj[node.property];
  }

  override visitIndexExpression(node: any): unknown {
    const obj = this.visit(node.object) as any;
    const index = this.visit(node.index) as string | number;
    if (obj === null || obj === undefined) {
      throw new Error(`Cannot read index of ${obj}`);
    }
    return obj[index];
  }

  override visitConditionalExpression(node: any): unknown {
    const test = this.visit(node.test);
    return test ? this.visit(node.consequent) : this.visit(node.alternate);
  }

  override visitArrayExpression(node: any): unknown {
    return node.elements.map((el: ASTNode) => this.visit(el));
  }

  override visitObjectExpression(node: any): unknown {
    const obj: Record<string, unknown> = {};
    for (const prop of node.properties) {
      obj[prop.key] = this.visit(prop.value);
    }
    return obj;
  }

  override visitLambdaExpression(node: LambdaExpressionNode): unknown {
    // 创建并返回一个 IFunction 对象
    const lambdaFunc: IFunction = {
      name: "<lambda>",
      description: "lambda函数",
      signature: { paramTypes: [], returnType: "any" }, // 类型可后续细化
      execute(args: unknown[], callContext: ExecutionContext): unknown {
        // 创建子作用域：绑定参数到形参名
        const childVars: Record<string, unknown> = {};
        node.params.forEach((param, index) => {
          childVars[param] = args[index];
        });
        // 基于调用时的上下文创建执行上下文（避免污染原始上下文）
        const localContext = callContext.createChild(childVars);
        const interpreter = new Interpreter(localContext);
        return interpreter.evaluate(node.body);
      },
    };
    return lambdaFunc;
  }
}
