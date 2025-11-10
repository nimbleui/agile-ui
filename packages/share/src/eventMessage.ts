// 信息发送类型
interface MessageBodyType<T> {
  __key__: string;
  data: T;
}
// 使用message的通信
/**
 *  发送信息，子主应用都能渲染
 * @param key
 * @param data  发送的数据
 * @param callback 回调函数
 * @param origin
 */
export function sendMessage<T = any, D = any>(
  key: string,
  data: T,
  options?: {callback?: (data?: D) => void; origin?: string; namespace?: string}
) {
  const originWindow = (window as any).rawWindow || window;
  const {callback, origin = '*', namespace = ''} = options || {};
  originWindow.postMessage(
    {
      __key__: namespace ? `${namespace}_${key}` : key,
      data,
    },
    origin
  );
  if (typeof callback === 'function') {
    callback();
  }
}

/**
 * 监听消息
 * @param key
 * @param callback
 * @returns
 */
export function onMessage<T>(
  key: string,
  callback: (data: any) => void,
  namespace?: string
) {
  const originWindow = (window as any).rawWindow || window;
  const fn = (e: MessageEvent<MessageBodyType<T>>) => {
    const matchKey = namespace ? `${namespace}_${key}` : key;
    if (e.data.__key__ === matchKey) {
      callback(e.data.data);
    }
  };
  originWindow.addEventListener('message', fn);
  return () => {
    originWindow.removeEventListener('message', fn);
  };
}
