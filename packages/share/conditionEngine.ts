function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key];
    }
    return undefined;
  }, obj);
}

function resolveValue(value: string, data: any): string | number | boolean {
  if (value === null || value === undefined) {
    return value;
  }

  // 字符串变量解析
  if (typeof value === 'string') {
    // 简单变量 {{state.modals.dialog1}}
    const variableMatch = value.match(/\{\{\s*([^}]+)\s*\}\}/);
    if (variableMatch) {
      const path = variableMatch[1].trim();
      const resolved = getNestedValue(data, path);
      return resolved !== undefined ? resolved : value;
    }

    // 布尔值转换
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // 数字转换
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }
  }

  return value;
}

// Vue3低代码平台事件绑定与交互实现，怎样实现事件链和条件执行
function compareValues(left: any, right: any, operator: string): boolean {
    switch (operator) {
      case 'eq':
        return left == right;
      case 'neq': 
        return left != right;
      case 'gt':
        return left > right;
      case 'gte':
        return left >= right;
      case 'lt':
        return left < right;
      case 'lte':
        return left <= right;
      case 'contains':
        if (Array.isArray(left)) {
          return left.includes(right);
        }
        return String(left).includes(String(right));
      case 'regex':
        try {
          return new RegExp(right).test(String(left));
        } catch {
          return false;
        }
      case 'empty':
        return left === null || left === undefined || left === '' || 
              (Array.isArray(left) && left.length === 0) ||
              (typeof left === 'object' && Object.keys(left).length === 0);
      case 'not_empty':
        return !compareValues(left, right, 'empty');
      default:
        console.warn(`未知的操作符: ${operator}`);
        return false;
    }
  }
