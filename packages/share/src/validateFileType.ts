import {imageExtensions} from './getFileTypeByExtension';

/**
 * 文件类型后缀校验方法
 * @param {string} fileName - 文件名
 * @param {string} accept - 接受的文件类型，如 "image/*,.pdf,.doc"
 * @returns {boolean} - 是否通过校验
 */
export function validateFileType(fileName: string, accept?: string) {
  if (!fileName) return false;
  // 没有类型限制
  if (!accept) {
    return true;
  }
  // 获取文件后缀（转换为小写）
  const fileExtension = `${fileName}`.toLowerCase().split('.').pop();
  if (!fileExtension) return false;

  // 分割accept字符串为数组并处理
  const acceptTypes = accept
    .toLowerCase()
    .split(',')
    .map((type) => type.trim());

  // 检查每个接受类型
  for (const type of acceptTypes) {
    if (type === '*') {
      // 接受所有文件类型
      return true;
    } else if (type === 'image/*') {
      // 检查是否为图片类型
      if (isImageType(fileExtension)) {
        return true;
      }
    } else if (type.startsWith('.')) {
      // 直接后缀匹配，如 ".pdf"
      if (`.${fileExtension}` === type) {
        return true;
      }
    } else if (type.includes('/')) {
      // MIME类型匹配，如 "image/jpeg"
      const mimeExtension = getExtensionFromMime(type);
      if (fileExtension === mimeExtension) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 检查文件后缀是否为图片类型
 * @param {string} extension - 文件后缀
 * @returns {boolean}
 */
function isImageType(extension: string) {
  return imageExtensions.includes(extension);
}

/**
 * 从MIME类型获取可能的文件后缀
 * @param {string} mimeType - MIME类型
 * @returns {string}
 */
function getExtensionFromMime(mimeType: string) {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };

  return mimeMap[mimeType] || '';
}
