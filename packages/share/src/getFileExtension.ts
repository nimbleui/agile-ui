// 获取文件后缀
export function getFileExtension(filenameOrUrl?: string) {
  if (!filenameOrUrl) {
    return '';
  }

  // 处理URL中的查询参数和哈希
  const filename = filenameOrUrl.split('?')[0].split('#')[0];

  // 提取最后一个点后面的部分
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return '';
  }
  // 获取后缀并转换为小写
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

// 获取文件名

export function getFileName(path: string) {
  if (!path) return '';
  // 先去除查询参数和哈希
  const cleanPath = path.split('?')[0].split('#')[0];
  // 再提取文件名
  return cleanPath?.split('/').pop() || '';
}

export function isImageFile(filename?: string) {
  if (!filename) return false;
  const cleanName = filename.split('?')[0].split('#')[0];
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(cleanName);
}
