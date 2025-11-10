// 图片类型后缀
export const imageExtensions = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'bmp',
  'ico',
  'tiff',
  'heic',
  'heif',
];

// 视频类型后缀
export const videoExtensions = [
  'mp4',
  'mov',
  'avi',
  'wmv',
  'flv',
  'mkv',
  'webm',
  'mpeg',
  'mpg',
  '3gp',
  'm4v',
];

// 音频类型后缀
export const audioExtensions = [
  'mp3',
  'wav',
  'ogg',
  'aac',
  'flac',
  'm4a',
  'wma',
  'amr',
  'mid',
  'midi',
];

// 文档类型后缀
export const documentExtensions = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'csv',
  'rtf',
  'odt',
  'ods',
  'odp',
  'pages',
  'numbers',
  'key',
  'md',
  'epub',
  'mobi',
  'tex',
  'log',
];

export function getFileTypeByExtension(extension: string) {
  if (!extension) return 'other';

  if (imageExtensions.includes(extension)) {
    return 'image';
  }

  if (videoExtensions.includes(extension)) {
    return 'video';
  }

  if (audioExtensions.includes(extension)) {
    return 'audio';
  }

  if (documentExtensions.includes(extension)) {
    return 'document';
  }

  return 'other';
}
