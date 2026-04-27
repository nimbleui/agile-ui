import { Type } from "../type-system/Types";

export interface CustomFunctionDef {
  /** 唯一标识（用于存储/更新） */
  id: string;
  /** 函数名（调用时使用） */
  name: string;
  /** 描述文本 */
  description: string;
  /** 参数列表 */
  params: FunctionParam[];
  /** 函数体（使用表达式语法） */
  body: string;
  /** 返回值类型约束（可选） */
  returnType?: Type;
}

export interface FunctionParam {
  /** 参数名 */
  name: string;
  /** 期望类型（用于 UI 提示与编译时优化） */
  type?: Type;
  /** 默认值（表达式字符串或直接值） */
  default?: string;
}
