import { Type, Types } from "./Types";
import { ASTNode } from "../parser/AST";

/**
 * 类型上下文接口
 * 提供变量和函数类型信息的查询能力
 */
export interface TypeContext {
  /** 根据变量名获取其类型 */
  getVariableType(name: string): Type | undefined;
  /** 根据函数名和参数类型获取返回值类型 */
  getFunctionReturnType(name: string, argTypes: Type[]): Type | undefined;
}

/**
 * 类型检查器
 * 负责推导表达式的类型，并进行类型兼容性验证
 */
export class TypeChecker {
  /**
   * 推导表达式的类型
   * @param node AST 节点
   * @param context 类型上下文
   */
  infer(node: ASTNode, context: TypeContext): Type {
    switch (node.type) {
      case "Literal":
        // 字面量的类型在解析时已标注
        return node.valueType;

      case "Identifier":
        // 从上下文中查找变量类型
        const varType = context.getVariableType(node.name);
        return varType ?? Types.unknown;

      case "UnaryExpression":
        const argType = this.infer(node.argument, context);
        // 逻辑非总是返回 boolean
        if (node.operator === "!" || node.operator === "not") {
          return Types.boolean;
        }
        // 负号要求操作数为 number
        if (node.operator === "-") {
          if (argType === Types.number) return Types.number;
          throw new TypeError(`Cannot apply unary '-' to type ${Types.toString(argType)}`);
        }
        return Types.unknown;

      case "BinaryExpression":
        return this.inferBinaryExpression(node, context);

      case "LogicalExpression":
        // 逻辑表达式总是返回 boolean
        return Types.boolean;

      case "CallExpression":
        return this.inferCallExpression(node, context);

      case "MemberExpression":
        return this.inferMemberExpression(node, context);

      case "IndexExpression":
        return this.inferIndexExpression(node, context);

      case "ConditionalExpression":
        // 三元表达式的类型是真假分支类型的联合（简化处理为 any 或统一类型）
        const consequentType = this.infer(node.consequent, context);
        const alternateType = this.infer(node.alternate, context);
        return this.unifyTypes(consequentType, alternateType);

      case "ArrayExpression":
        // 空数组类型为 Array<any>
        if (node.elements.length === 0) return Types.arrayOf(Types.any);
        // 非空数组推导元素类型的公共超类型
        const elementTypes = node.elements.map((e) => this.infer(e, context));
        const unified = elementTypes.reduce((a, b) => this.unifyTypes(a, b));
        return Types.arrayOf(unified);

      case "ObjectExpression":
        // 构建对象类型
        const props = new Map<string, Type>();
        for (const prop of node.properties) {
          props.set(prop.key, this.infer(prop.value, context));
        }
        return { kind: "object", properties: props };

      default:
        return Types.unknown;
    }
  }

  /**
   * 推导二元表达式的类型
   */
  private inferBinaryExpression(node: any, context: TypeContext, debug = false): Type {
    const left = this.infer(node.left, context);
    const right = this.infer(node.right, context);
    const op = node.operator;

    if (left === Types.unknown || right === Types.unknown) {
      if (debug) console.debug(`Binary '${op}' has unknown operand(s)`);
      return Types.unknown;
    }

    // 算术运算符要求两边为 number，返回 number；字符串拼接返回 string
    if (["+", "-", "*", "/", "%"].includes(op)) {
      if (left === Types.number && right === Types.number) return Types.number;
      if (op === "+" && left === Types.string && right === Types.string) return Types.string;
      throw new TypeError(`Operator '${op}' cannot be applied to ${Types.toString(left)} and ${Types.toString(right)}`);
    }

    // 比较运算符返回 boolean
    if (["==", "!=", ">", "<", ">=", "<="].includes(op)) {
      return Types.boolean;
    }

    return Types.unknown;
  }

  /**
   * 推导函数调用表达式的类型
   */
  private inferCallExpression(node: any, context: TypeContext): Type {
    const argTypes = node.arguments.map((arg: ASTNode) => this.infer(arg, context));
    const returnType = context.getFunctionReturnType(node.callee, argTypes);
    return returnType ?? Types.unknown;
  }

  /**
   * 推导成员访问表达式的类型
   */
  private inferMemberExpression(node: any, context: TypeContext): Type {
    const objType = this.infer(node.object, context);
    // 如果对象类型是已知的对象类型，查找属性类型
    if (typeof objType === "object" && objType.kind === "object") {
      return objType.properties.get(node.property) ?? Types.unknown;
    }
    return Types.unknown;
  }

  /**
   * 推导索引访问表达式的类型
   */
  private inferIndexExpression(node: any, context: TypeContext): Type {
    const objType = this.infer(node.object, context);
    // 如果对象是数组，返回元素类型
    if (typeof objType === "object" && objType.kind === "array") {
      return objType.elementType;
    }
    return Types.unknown;
  }

  /**
   * 合并两个类型（简化实现：相同则返回，否则 any）
   */
  private unifyTypes(a: Type, b: Type): Type {
    if (a === b) return a;
    return Types.any;
  }

  /**
   * 验证表达式的类型是否符合预期
   */
  validate(node: ASTNode, context: TypeContext, expectedType?: Type): void {
    const inferred = this.infer(node, context);
    if (expectedType && !this.isAssignable(inferred, expectedType)) {
      throw new TypeError(`Type mismatch: expected ${Types.toString(expectedType)}, got ${Types.toString(inferred)}`);
    }
  }

  /**
   * 判断源类型是否可以赋值给目标类型（简化版）
   */
  isAssignable(source: Type, target: Type): boolean {
    if (source === target) return true;
    if (target === Types.any || target === Types.unknown) return true;
    if (source === Types.null && target !== Types.null) return false;
    return false;
  }
}
