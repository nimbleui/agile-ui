import { Type } from "../type-system/Types";

/**
 * AST 节点联合类型
 * 包含表达式可能产生的所有节点类型
 */
export type ASTNode =
  | LiteralNode // 字面量节点
  | IdentifierNode // 标识符节点
  | BinaryExpressionNode // 二元表达式节点
  | UnaryExpressionNode // 一元表达式节点
  | LogicalExpressionNode // 逻辑表达式节点
  | CallExpressionNode // 函数调用节点
  | MemberExpressionNode // 成员访问节点
  | IndexExpressionNode // 索引访问节点
  | ConditionalExpressionNode // 条件表达式节点（三元运算符）
  | ArrayExpressionNode // 数组字面量节点
  | ObjectExpressionNode; // 对象字面量节点

/**
 * 字面量节点
 * 例如：123, "hello", true, null
 */
export interface LiteralNode {
  type: "Literal";
  value: number | string | boolean | null; // 字面量的 JavaScript 值
  raw: string; // 源代码中的原始字符串表示
  valueType: Type; // 类型标注
}

/**
 * 标识符节点
 * 例如：变量名、函数名
 */
export interface IdentifierNode {
  type: "Identifier";
  name: string; // 标识符名称
}

/**
 * 二元表达式节点
 * 例如：a + b, x * y, a > b
 */
export interface BinaryExpressionNode {
  type: "BinaryExpression";
  operator: string; // 运算符，如 '+', '-', '=='
  left: ASTNode; // 左操作数
  right: ASTNode; // 右操作数
}

/**
 * 一元表达式节点
 * 例如：!flag, -value, not active
 */
export interface UnaryExpressionNode {
  type: "UnaryExpression";
  operator: string; // 运算符，如 '!', '-', 'not'
  argument: ASTNode; // 操作数
}

/**
 * 逻辑表达式节点（短路求值）
 * 例如：a && b, x or y
 */
export interface LogicalExpressionNode {
  type: "LogicalExpression";
  operator: "&&" | "||" | "and" | "or";
  left: ASTNode;
  right: ASTNode;
}

/**
 * 函数调用节点
 * 例如：max(1, 2, 3), length(str)
 */
export interface CallExpressionNode {
  type: "CallExpression";
  callee: string; // 被调用的函数名
  arguments: ASTNode[]; // 参数列表
}

/**
 * 成员访问节点（点运算符）
 * 例如：user.name, obj.prop
 */
export interface MemberExpressionNode {
  type: "MemberExpression";
  object: ASTNode; // 被访问的对象
  property: string; // 属性名
  computed: boolean; // 是否为计算属性（目前仅用于区分，实际索引访问用 IndexExpression）
}

/**
 * 索引访问节点（方括号）
 * 例如：arr[0], obj["key"]
 */
export interface IndexExpressionNode {
  type: "IndexExpression";
  object: ASTNode; // 被访问的对象
  index: ASTNode; // 索引表达式
}

/**
 * 条件表达式节点（三元运算符）
 * 例如：condition ? trueExpr : falseExpr
 */
export interface ConditionalExpressionNode {
  type: "ConditionalExpression";
  test: ASTNode; // 条件表达式
  consequent: ASTNode; // 条件为真时的结果表达式
  alternate: ASTNode; // 条件为假时的结果表达式
}

/**
 * 数组字面量节点
 * 例如：[1, 2, 3], ["a", "b"]
 */
export interface ArrayExpressionNode {
  type: "ArrayExpression";
  elements: ASTNode[]; // 数组元素列表
}

/**
 * 对象字面量节点
 * 例如：{ name: "John", age: 30 }
 */
export interface ObjectExpressionNode {
  type: "ObjectExpression";
  properties: Array<{ key: string; value: ASTNode }>; // 属性键值对列表
}

/**
 * AST 访问者基类（Visitor 模式）
 * 用于实现对 AST 的遍历操作，子类可重写特定节点的访问方法
 */
export class ASTVisitor<T = void> {
  /**
   * 访问入口，根据节点类型分派到对应的 visit 方法
   */
  visit(node: ASTNode): T {
    switch (node.type) {
      case "Literal":
        return this.visitLiteral(node);
      case "Identifier":
        return this.visitIdentifier(node);
      case "BinaryExpression":
        return this.visitBinaryExpression(node);
      case "UnaryExpression":
        return this.visitUnaryExpression(node);
      case "LogicalExpression":
        return this.visitLogicalExpression(node);
      case "CallExpression":
        return this.visitCallExpression(node);
      case "MemberExpression":
        return this.visitMemberExpression(node);
      case "IndexExpression":
        return this.visitIndexExpression(node);
      case "ConditionalExpression":
        return this.visitConditionalExpression(node);
      case "ArrayExpression":
        return this.visitArrayExpression(node);
      case "ObjectExpression":
        return this.visitObjectExpression(node);
      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  // 以下方法默认为空实现，子类按需重写
  visitLiteral(node: LiteralNode): T {
    return this.visitChildren(node);
  }
  visitIdentifier(node: IdentifierNode): T {
    return this.visitChildren(node);
  }
  visitBinaryExpression(node: BinaryExpressionNode): T {
    return this.visitChildren(node);
  }
  visitUnaryExpression(node: UnaryExpressionNode): T {
    return this.visitChildren(node);
  }
  visitLogicalExpression(node: LogicalExpressionNode): T {
    return this.visitChildren(node);
  }
  visitCallExpression(node: CallExpressionNode): T {
    return this.visitChildren(node);
  }
  visitMemberExpression(node: MemberExpressionNode): T {
    return this.visitChildren(node);
  }
  visitIndexExpression(node: IndexExpressionNode): T {
    return this.visitChildren(node);
  }
  visitConditionalExpression(node: ConditionalExpressionNode): T {
    return this.visitChildren(node);
  }
  visitArrayExpression(node: ArrayExpressionNode): T {
    return this.visitChildren(node);
  }
  visitObjectExpression(node: ObjectExpressionNode): T {
    return this.visitChildren(node);
  }

  /**
   * 遍历子节点（默认不做任何事，子类可重写以实现自动遍历）
   */
  protected visitChildren(node: ASTNode): T {
    void node;
    return undefined as unknown as T;
  }
}
