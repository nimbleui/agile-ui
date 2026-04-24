/**
 * 语法过滤器
 * 在词法/语法分析之前对源码进行安全性检查，拦截危险模式
 */
export class SyntaxFilter {
  /**
   * 禁止出现的危险模式（正则表达式列表）
   * 防止原型链污染、代码注入、全局对象访问等
   */
  private readonly forbiddenPatterns: RegExp[] = [
    /__proto__/g, // 原型链污染
    /constructor/g, // 构造函数访问
    /prototype/g, // 原型访问
    /Function\s*\(/g, // 函数构造器
    /eval\s*\(/g, // eval 执行
    /setTimeout\s*\(/g, // 定时器
    /setInterval\s*\(/g, // 定时器
    /import\s*\(/g, // 动态导入
    /require\s*\(/g, // CommonJS 导入
    /process\s*\./g, // Node.js 进程对象
    /global\s*\./g, // Node.js 全局对象
    /window\s*\./g, // 浏览器 window 对象
    /document\s*\./g, // 浏览器 document 对象
    /localStorage/g, // 本地存储
    /sessionStorage/g, // 会话存储
    /fetch\s*\(/g, // 网络请求
    /XMLHttpRequest/g, // Ajax
    /WebSocket/g, // WebSocket
  ];

  private readonly maxLength: number = 10000; // 表达式最大长度限制
  private readonly allowedFunctions: Set<string>; // 允许调用的函数白名单

  /**
   * @param allowedFunctions 允许的函数名列表
   */
  constructor(allowedFunctions: string[] = []) {
    this.allowedFunctions = new Set(allowedFunctions);
  }

  /**
   * 对源码执行安全校验，若发现危险模式则抛出错误
   */
  validate(source: string): void {
    // 长度限制
    if (source.length > this.maxLength) {
      throw new Error(`Expression too long: ${source.length} characters (max ${this.maxLength})`);
    }

    // 检查危险模式
    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(source)) {
        throw new Error(`Forbidden pattern detected: ${pattern}`);
      }
    }
  }

  /**
   * 检查函数名是否在白名单中
   */
  isFunctionAllowed(name: string): boolean {
    return this.allowedFunctions.has(name);
  }
}
