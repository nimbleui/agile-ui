/**
 * Token 类型枚举
 * 定义表达式词法分析中可能出现的所有 Token 类型
 */
export enum TokenType {
  // 字面量类型
  NUMBER = "NUMBER", // 数字字面量，如 123, 3.14
  STRING = "STRING", // 字符串字面量，如 "hello", 'world'
  BOOLEAN = "BOOLEAN", // 布尔字面量，true/false
  NULL = "NULL", // null 字面量

  // 标识符
  IDENTIFIER = "IDENTIFIER", // 变量名、函数名

  // 运算符
  PLUS = "+", // 加号
  MINUS = "-", // 减号
  MULTIPLY = "*", // 乘号
  DIVIDE = "/", // 除号
  MODULO = "%", // 取模运算符
  AND = "&&", // 逻辑与
  OR = "||", // 逻辑或
  NOT = "!", // 逻辑非
  EQ = "==", // 相等比较
  NEQ = "!=", // 不等比较
  GT = ">", // 大于
  LT = "<", // 小于
  GTE = ">=", // 大于等于
  LTE = "<=", // 小于等于

  // 分隔符
  LPAREN = "(", // 左圆括号
  RPAREN = ")", // 右圆括号
  LBRACKET = "[", // 左方括号
  RBRACKET = "]", // 右方括号
  LBRACE = "{", // 左花括号
  RBRACE = "}", // 右花括号
  DOT = ".", // 点运算符，用于成员访问
  COMMA = ",", // 逗号，用于分隔参数
  COLON = ":", // 冒号，用于对象字面量
  QUESTION = "?", // 问号，用于三元运算符

  // 关键字（文本形式）
  AND_KW = "and", // 关键字 and
  OR_KW = "or", // 关键字 or
  NOT_KW = "not", // 关键字 not
  TRUE = "true", // 关键字 true
  FALSE = "false", // 关键字 false
  NULL_KW = "null", // 关键字 null

  EOF = "EOF", // 文件结束标记
}

/**
 * Token 类，表示词法分析后的一个词法单元
 * 包含类型、值以及源代码中的位置信息，便于错误追踪
 */
export class Token {
  /**
   * @param type       Token 类型
   * @param value      Token 原始字符串值
   * @param position   在源码中的字符索引位置
   * @param line       所在行号（从1开始）
   * @param column     所在列号（从1开始）
   */
  constructor(
    public readonly type: TokenType,
    public readonly value: string,
    public readonly position: number,
    public readonly line: number,
    public readonly column: number,
  ) {}

  /**
   * 返回 Token 的可读字符串表示，用于调试
   */
  toString(): string {
    return `Token(${this.type}, '${this.value}', ${this.line}:${this.column})`;
  }
}
