import { Token, TokenType } from "../lexer/Token";
import { Lexer } from "../lexer/Lexer";
import {
  ASTNode,
  LiteralNode,
  IdentifierNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  LogicalExpressionNode,
  CallExpressionNode,
  MemberExpressionNode,
  IndexExpressionNode,
  ConditionalExpressionNode,
  ArrayExpressionNode,
  ObjectExpressionNode,
} from "./AST";

/**
 * 语法分析器（Parser）
 * 采用递归下降算法，将 Token 流解析为 AST
 */
export class Parser {
  private tokens: Token[] = []; // Token 数组
  private current: number = 0; // 当前 Token 索引
  private readonly lexer = new Lexer(); // 词法分析器实例

  /**
   * 解析源代码字符串，返回 AST 根节点
   */
  parse(source: string): ASTNode {
    this.tokens = this.lexer.tokenize(source); // 词法分析
    this.current = 0; // 重置索引
    return this.parseExpression(); // 从表达式开始解析
  }

  /**
   * 查看当前 Token，不移动索引
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * 返回上一个被消费的 Token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * 判断是否已到达 Token 流末尾
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * 消费当前 Token 并返回它，同时索引前进
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /**
   * 检查当前 Token 是否为指定类型
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * 如果当前 Token 匹配任意给定类型，则消费并返回 true
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  /**
   * 强制要求当前 Token 为指定类型，否则抛出错误
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} at ${this.peek().line}:${this.peek().column}`);
  }

  /**
   * 解析表达式，支持运算符优先级（Pratt 解析器风格）
   * @param precedence 当前上下文允许的最小优先级
   */
  private parseExpression(precedence: number = 0): ASTNode {
    let left = this.parsePrimary(); // 解析左操作数（原子表达式）
    // 循环处理中缀运算符
    while (true) {
      const token = this.peek();
      const tokenPrecedence = this.getPrecedence(token.type);
      // 如果当前运算符优先级不高于传入的优先级，则停止（确保结合性正确）
      if (tokenPrecedence <= precedence) break;

      this.advance(); // 消费运算符

      // 特殊处理三元条件运算符 ? :
      if (token.type === TokenType.QUESTION) {
        const thenBranch = this.parseExpression(); // 解析真值分支
        this.consume(TokenType.COLON, "Expected ':' in conditional expression");
        const elseBranch = this.parseExpression(tokenPrecedence); // 解析假值分支
        left = {
          type: "ConditionalExpression",
          test: left,
          consequent: thenBranch,
          alternate: elseBranch,
        } as ConditionalExpressionNode;
      } else if (this.isBinaryOperator(token.type)) {
        // 解析右操作数，优先级稍高以实现左结合
        const right = this.parseExpression(tokenPrecedence);
        // 根据运算符类型创建逻辑表达式或二元表达式节点
        if (
          token.type === TokenType.AND ||
          token.type === TokenType.OR ||
          token.type === TokenType.AND_KW ||
          token.type === TokenType.OR_KW
        ) {
          left = {
            type: "LogicalExpression",
            operator: token.value as any,
            left,
            right,
          } as LogicalExpressionNode;
        } else {
          left = {
            type: "BinaryExpression",
            operator: token.value,
            left,
            right,
          } as BinaryExpressionNode;
        }
      } else {
        // 不应该执行到这里
        throw new Error(`Unexpected token: ${token.type}`);
      }
    }

    return left;
  }

  /**
   * 解析原子表达式（字面量、标识符、括号、一元运算符等）
   */
  private parsePrimary(): ASTNode {
    // 处理一元运算符：!, -, not
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.NOT_KW)) {
      const operator = this.previous();
      const argument = this.parsePrimary(); // 递归解析操作数
      return {
        type: "UnaryExpression",
        operator: operator.value,
        argument,
      } as UnaryExpressionNode;
    }

    const token = this.peek();

    // 数字字面量
    if (token.type === TokenType.NUMBER) {
      this.advance();
      const num = parseFloat(token.value);
      return {
        type: "Literal",
        value: num,
        raw: token.value,
        valueType: "number",
      } as LiteralNode;
    }
    // 字符串字面量
    if (token.type === TokenType.STRING) {
      this.advance();
      return {
        type: "Literal",
        value: token.value,
        raw: `"${token.value}"`,
        valueType: "string",
      } as LiteralNode;
    }
    // 布尔字面量 true
    if (token.type === TokenType.TRUE) {
      this.advance();
      return { type: "Literal", value: true, raw: "true", valueType: "boolean" } as LiteralNode;
    }
    // 布尔字面量 false
    if (token.type === TokenType.FALSE) {
      this.advance();
      return { type: "Literal", value: false, raw: "false", valueType: "boolean" } as LiteralNode;
    }
    // null 字面量
    if (token.type === TokenType.NULL_KW) {
      this.advance();
      return { type: "Literal", value: null, raw: "null", valueType: "null" } as LiteralNode;
    }

    // 标识符（可能后跟成员访问、索引或函数调用）
    if (token.type === TokenType.IDENTIFIER) {
      return this.parseIdentifierExpression();
    }

    // 括号分组 ( expression )
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }

    // 数组字面量 [ ... ]
    if (this.match(TokenType.LBRACKET)) {
      return this.parseArrayExpression();
    }

    // 对象字面量 { ... }
    if (this.match(TokenType.LBRACE)) {
      return this.parseObjectExpression();
    }

    throw new Error(`Unexpected token: ${token.type} at ${token.line}:${token.column}`);
  }

  /**
   * 解析以标识符开头的表达式，处理链式调用（成员访问、索引、函数调用）
   */
  private parseIdentifierExpression(): ASTNode {
    const idToken = this.advance();
    let expr: ASTNode = {
      type: "Identifier",
      name: idToken.value,
    } as IdentifierNode;

    // 循环处理后续的 . [] () 操作符
    while (true) {
      if (this.match(TokenType.DOT)) {
        // 成员访问：.propertyName
        const propToken = this.consume(TokenType.IDENTIFIER, "Expected property name after '.'");
        expr = {
          type: "MemberExpression",
          object: expr,
          property: propToken.value,
          computed: false,
        } as MemberExpressionNode;
      } else if (this.match(TokenType.LBRACKET)) {
        // 索引访问：[index]
        const index = this.parseExpression();
        this.consume(TokenType.RBRACKET, "Expected ']' after index");
        expr = {
          type: "IndexExpression",
          object: expr,
          index,
        } as IndexExpressionNode;
      } else if (this.match(TokenType.LPAREN)) {
        // 函数调用：(arguments)
        const args = this.parseArguments();
        this.consume(TokenType.RPAREN, "Expected ')' after arguments");
        // 被调用者必须是简单标识符
        if (expr.type !== "Identifier") {
          throw new Error("Function name must be a simple identifier");
        }
        expr = {
          type: "CallExpression",
          callee: (expr as IdentifierNode).name,
          arguments: args,
        } as CallExpressionNode;
      } else {
        break; // 没有更多后缀操作符
      }
    }

    return expr;
  }

  /**
   * 解析函数调用的参数列表
   */
  private parseArguments(): ASTNode[] {
    const args: ASTNode[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression()); // 解析每个参数
      } while (this.match(TokenType.COMMA)); // 逗号分隔
    }
    return args;
  }

  /**
   * 解析数组字面量 [element1, element2, ...]
   */
  private parseArrayExpression(): ASTNode {
    const elements: ASTNode[] = [];
    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RBRACKET, "Expected ']' after array elements");
    return { type: "ArrayExpression", elements } as ArrayExpressionNode;
  }

  /**
   * 解析对象字面量 { key: value, ... }
   */
  private parseObjectExpression(): ASTNode {
    const properties: Array<{ key: string; value: ASTNode }> = [];
    if (!this.check(TokenType.RBRACE)) {
      do {
        const keyToken = this.consume(TokenType.IDENTIFIER, "Expected property name");
        this.consume(TokenType.COLON, "Expected ':' after property name");
        const value = this.parseExpression();
        properties.push({ key: keyToken.value, value });
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RBRACE, "Expected '}' after object properties");
    return { type: "ObjectExpression", properties } as ObjectExpressionNode;
  }

  /**
   * 获取运算符的优先级（数值越大优先级越高）
   */
  private getPrecedence(type: TokenType): number {
    switch (type) {
      case TokenType.OR:
      case TokenType.OR_KW:
        return 1; // 逻辑或
      case TokenType.AND:
      case TokenType.AND_KW:
        return 2; // 逻辑与
      case TokenType.EQ:
      case TokenType.NEQ:
      case TokenType.GT:
      case TokenType.LT:
      case TokenType.GTE:
      case TokenType.LTE:
        return 3; // 比较运算符
      case TokenType.PLUS:
      case TokenType.MINUS:
        return 4; // 加减
      case TokenType.MULTIPLY:
      case TokenType.DIVIDE:
      case TokenType.MODULO:
        return 5; // 乘除取模
      default:
        return 0; // 非运算符
    }
  }

  /**
   * 判断 Token 类型是否为二元运算符
   */
  private isBinaryOperator(type: TokenType): boolean {
    return [
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.MULTIPLY,
      TokenType.DIVIDE,
      TokenType.MODULO,
      TokenType.EQ,
      TokenType.NEQ,
      TokenType.GT,
      TokenType.LT,
      TokenType.GTE,
      TokenType.LTE,
      TokenType.AND,
      TokenType.OR,
      TokenType.AND_KW,
      TokenType.OR_KW,
    ].includes(type);
  }
}
