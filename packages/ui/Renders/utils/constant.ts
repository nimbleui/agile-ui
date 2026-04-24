/** 匹配字符串格式：$xxx{{xxx}} */
export const getSignAndValueReg = /\$([^{]+)\{\{([^}]+)\}\}/;
/** 全局匹配字符串格式：$xxx{{xxx}} */
export const getSignAndValueGReg = /\$([^{]+)\{\{([^}]+)\}\}/g;
