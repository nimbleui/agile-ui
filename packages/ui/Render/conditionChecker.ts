// 条件类型
export type OperatorType = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "regex" | "empty" | "not_empty";
export interface ConditionType {
  id: string;
  type: "expression" | "function" | "api";
  left: string;
  operator: OperatorType;
  right: any;
  logical?: "and" | "or";
}

/**
 * 比较操作符
 * @param left 左边的值
 * @param right 右边的值
 * @param operator 运算符
 * @returns
 */
function compareValues(left: any, right: any, operator: OperatorType): boolean {
  switch (operator) {
    case "eq":
      return left == right;
    case "neq":
      return left != right;
    case "gt":
      return left > right;
    case "gte":
      return left >= right;
    case "lt":
      return left < right;
    case "lte":
      return left <= right;
    case "contains":
      if (Array.isArray(left)) {
        return left.includes(right);
      }
      return String(left).includes(String(right));
    case "regex":
      try {
        return new RegExp(right).test(String(left));
      } catch {
        return false;
      }
    case "empty":
      return (
        left === null ||
        left === undefined ||
        left === "" ||
        (Array.isArray(left) && left.length === 0) ||
        (typeof left === "object" && Object.keys(left).length === 0)
      );
    case "not_empty":
      return !compareValues(left, right, "empty");
    default:
      console.warn(`未知的操作符: ${operator}`);
      return false;
  }
}

export function evaluateCondition(condition: ConditionType): boolean {
  return true;
}
