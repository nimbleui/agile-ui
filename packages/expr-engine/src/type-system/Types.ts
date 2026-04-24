/**
 * 基础类型定义（原始类型）
 */
export type PrimitiveType = "number" | "string" | "boolean" | "null" | "undefined" | "any" | "unknown" | "void";

/**
 * 数组类型
 */
export interface ArrayType {
  kind: "array";
  elementType: Type; // 数组元素类型
}

/**
 * 对象类型（记录类型）
 */
export interface ObjectType {
  kind: "object";
  properties: Map<string, Type>; // 属性名到类型的映射
}

/**
 * 函数类型
 */
export interface FunctionType {
  kind: "function";
  paramTypes: Type[]; // 参数类型列表
  returnType: Type; // 返回值类型
}

/**
 * 类型的联合定义
 */
export type Type = PrimitiveType | ArrayType | ObjectType | FunctionType;

/**
 * 类型构造工具对象
 */
export const Types = {
  number: "number" as const,
  string: "string" as const,
  boolean: "boolean" as const,
  null: "null" as const,
  undefined: "undefined" as const,
  any: "any" as const,
  unknown: "unknown" as const,
  void: "void" as const,

  /**
   * 构造数组类型
   */
  arrayOf(elementType: Type): ArrayType {
    return { kind: "array", elementType };
  },

  /**
   * 构造对象类型
   */
  object(properties: Record<string, Type>): ObjectType {
    return { kind: "object", properties: new Map(Object.entries(properties)) };
  },

  /**
   * 构造函数类型
   */
  func(paramTypes: Type[], returnType: Type): FunctionType {
    return { kind: "function", paramTypes, returnType };
  },

  /**
   * 将类型转换为可读字符串（用于错误提示）
   */
  toString(type: Type): string {
    if (typeof type === "string") return type;
    switch (type.kind) {
      case "array":
        return `Array<${Types.toString(type.elementType)}>`;
      case "object": {
        const props = Array.from(type.properties.entries())
          .map(([k, v]) => `${k}: ${Types.toString(v)}`)
          .join(", ");
        return `{ ${props} }`;
      }
      case "function": {
        const params = type.paramTypes.map((t) => Types.toString(t)).join(", ");
        return `(${params}) => ${Types.toString(type.returnType)}`;
      }
    }
  },
};
