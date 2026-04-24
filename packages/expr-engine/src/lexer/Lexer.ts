import { Token, TokenType } from "./Token";

/**
 * 词法分析器（Lexer）
 * 将源代码字符串转换为 Token 流
 */
export class Lexer {
  private source: string = ""; // 待分析的源代码
  private position: number = 0; // 当前字符在源代码中的索引位置
  private line: number = 1; // 当前行号
  private column: number = 1; // 当前列号

  /**
   * 关键字映射表，将字符串关键字映射到对应的 TokenType
   */
  private readonly keywords: Map<string, TokenType> = new Map([
    ["and", TokenType.AND_KW],
    ["or", TokenType.OR_KW],
    ["not", TokenType.NOT_KW],
    ["true", TokenType.TRUE],
    ["false", TokenType.FALSE],
    ["null", TokenType.NULL_KW],
  ]);

  /**
   * 对外公开的词法分析方法，返回 Token 数组
   * @param source 源代码字符串
   */
  tokenize(source: string): Token[] {
    this.source = source; // 保存源代码
    this.position = 0; // 重置位置
    this.line = 1; // 重置行号
    this.column = 1; // 重置列号
    const tokens: Token[] = []; // 存储结果的数组

    // 循环处理每一个字符，直到文件结束
    while (!this.isEOF()) {
      const char = this.peek(); // 查看当前字符

      // 跳过空白字符（空格、换行、制表符等）
      if (/\s/.test(char)) {
        this.advance(); // 前进到下一个字符
        continue;
      }

      // 处理数字字面量
      if (/[0-9]/.test(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      // 处理字符串字面量（支持单引号和双引号）
      if (char === '"' || char === "'") {
        tokens.push(this.readString(char));
        continue;
      }

      // 处理标识符（变量名）或关键字
      if (/[a-zA-Z_]/.test(char)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // 处理运算符和分隔符
      const opToken = this.readOperator();
      if (opToken) {
        tokens.push(opToken);
        continue;
      }

      // 如果没有匹配任何规则，抛出语法错误
      throw new Error(`${this.source}, Unexpected character '${char}' at ${this.line}:${this.column}`);
    }

    // 在末尾添加 EOF Token，表示输入结束
    tokens.push(new Token(TokenType.EOF, "", this.position, this.line, this.column));
    return tokens;
  }

  /**
   * 判断是否已到达源代码末尾
   */
  private isEOF(): boolean {
    return this.position >= this.source.length;
  }

  /**
   * 查看当前字符，但不移动位置指针
   */
  private peek(): string {
    return this.source[this.position];
  }

  /**
   * 消费当前字符，并返回该字符，同时更新行列信息
   */
  private advance(): string {
    const char = this.source[this.position++]; // 获取当前字符并移动指针
    if (char === "\n") {
      // 如果是换行符
      this.line++; // 行号加1
      this.column = 1; // 列号重置为1
    } else {
      this.column++; // 否则列号加1
    }
    return char;
  }

  /**
   * 读取一个数字字面量（支持整数和简单浮点数）
   */
  private readNumber(): Token {
    const startPos = this.position; // 记录起始位置
    const startLine = this.line; // 记录起始行
    const startCol = this.column; // 记录起始列
    let value = ""; // 数字字符串
    let hasDot = false; // 是否已包含小数点

    // 循环读取数字字符
    while (!this.isEOF()) {
      const char = this.peek();
      if (/[0-9]/.test(char)) {
        // 数字字符
        value += this.advance();
      } else if (char === "." && !hasDot) {
        // 第一个小数点
        hasDot = true;
        value += this.advance();
      } else {
        break; // 遇到非数字字符，结束读取
      }
    }

    return new Token(TokenType.NUMBER, value, startPos, startLine, startCol);
  }

  /**
   * 读取字符串字面量，支持转义字符
   * @param quote 字符串使用的引号类型（' 或 "）
   */
  private readString(quote: string): Token {
    const startPos = this.position;
    const startLine = this.line;
    const startCol = this.column;
    let value = "";
    this.advance(); // 跳过开始的引号

    // 循环读取直到遇到匹配的结束引号
    while (!this.isEOF()) {
      const char = this.peek();
      if (char === quote) {
        this.advance(); // 跳过结束引号
        break;
      }

      if (char === "\\") {
        // 处理转义字符
        this.advance(); // 消费反斜杠
        const escaped = this.advance(); // 获取被转义的字符
        switch (escaped) {
          case "n":
            value += "\n";
            break; // 换行
          case "t":
            value += "\t";
            break; // 制表
          case "r":
            value += "\r";
            break; // 回车
          case "\\":
            value += "\\";
            break; // 反斜杠本身
          case quote:
            value += quote;
            break; // 引号本身
          default:
            value += escaped; // 其他字符原样保留
        }
      } else {
        value += this.advance(); // 普通字符直接添加
      }
    }

    return new Token(TokenType.STRING, value, startPos, startLine, startCol);
  }

  /**
   * 读取标识符或关键字
   */
  private readIdentifier(): Token {
    const startPos = this.position;
    const startLine = this.line;
    const startCol = this.column;
    let value = "";

    // 标识符可以由字母、数字、下划线组成，且以字母或下划线开头
    while (!this.isEOF()) {
      const char = this.peek();
      if (/[a-zA-Z0-9_]/.test(char)) {
        value += this.advance();
      } else {
        break;
      }
    }

    // 检查是否为关键字
    const keywordType = this.keywords.get(value);
    if (keywordType) {
      return new Token(keywordType, value, startPos, startLine, startCol);
    }

    // 否则为普通标识符
    return new Token(TokenType.IDENTIFIER, value, startPos, startLine, startCol);
  }

  /**
   * 尝试读取运算符或分隔符
   * 返回对应的 Token，如果不是运算符则返回 null
   */
  private readOperator(): Token | null {
    const startPos = this.position;
    const startLine = this.line;
    const startCol = this.column;
    const char = this.peek();

    // 单字符运算符映射表
    const singleCharOps: Record<string, TokenType> = {
      "+": TokenType.PLUS,
      "-": TokenType.MINUS,
      "*": TokenType.MULTIPLY,
      "/": TokenType.DIVIDE,
      "%": TokenType.MODULO,
      "(": TokenType.LPAREN,
      ")": TokenType.RPAREN,
      "[": TokenType.LBRACKET,
      "]": TokenType.RBRACKET,
      "{": TokenType.LBRACE,
      "}": TokenType.RBRACE,
      ".": TokenType.DOT,
      ",": TokenType.COMMA,
      ":": TokenType.COLON,
      "?": TokenType.QUESTION,
      "!": TokenType.NOT,
    };

    // 如果是单字符运算符，直接返回
    if (char in singleCharOps) {
      this.advance();
      return new Token(singleCharOps[char], char, startPos, startLine, startCol);
    }

    // 处理双字符运算符（如 &&, ||, == 等）
    if (char === "&" && this.source[this.position + 1] === "&") {
      this.advance();
      this.advance(); // 消费两个字符
      return new Token(TokenType.AND, "&&", startPos, startLine, startCol);
    }
    if (char === "|" && this.source[this.position + 1] === "|") {
      this.advance();
      this.advance();
      return new Token(TokenType.OR, "||", startPos, startLine, startCol);
    }
    if (char === "=" && this.source[this.position + 1] === "=") {
      this.advance();
      this.advance();
      return new Token(TokenType.EQ, "==", startPos, startLine, startCol);
    }
    if (char === "!" && this.source[this.position + 1] === "=") {
      this.advance();
      this.advance();
      return new Token(TokenType.NEQ, "!=", startPos, startLine, startCol);
    }
    if (char === ">" && this.source[this.position + 1] === "=") {
      this.advance();
      this.advance();
      return new Token(TokenType.GTE, ">=", startPos, startLine, startCol);
    }
    if (char === "<" && this.source[this.position + 1] === "=") {
      this.advance();
      this.advance();
      return new Token(TokenType.LTE, "<=", startPos, startLine, startCol);
    }
    if (char === ">") {
      this.advance();
      return new Token(TokenType.GT, ">", startPos, startLine, startCol);
    }
    if (char === "<") {
      this.advance();
      return new Token(TokenType.LT, "<", startPos, startLine, startCol);
    }

    return null; // 不是运算符
  }
}
