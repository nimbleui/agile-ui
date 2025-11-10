/**
 * 防抖函数
 *
 * @param fn 回调函数
 * @param wait 表示时间窗口的间隔
 * @param immediate 是否立即执行
 * @param context 上下文环境
 *
 * @return () => void
 */
export function debounce(
  fn: (...args: any[]) => void,
  wait = 350,
  immediate = false,
  context?: any
): (...args: any[]) => void {
  let timer: any | null;

  return function (...args: []) {
    if (timer) clearTimeout(timer);
    if (immediate) {
      const callNaw = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      if (callNaw) {
        fn.apply(context, args);
      }
    } else {
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, wait);
    }
  };
}

/**
 * 节流函数
 * @param fn 回调函数
 * @param delay 间隔时间
 * @param context 上下文环境
 * @returns
 */
export function throttle(
  fn: (...args: any[]) => void,
  delay = 200,
  context?: any
) {
  let first = true;
  let timer = 0;
  return (...args: any[]) => {
    if (first) {
      fn.apply(context, args);
      first = false;
    }
    if (timer) return;
    timer = window.setTimeout(() => {
      clearTimeout(timer);
      timer = 0;
      fn.apply(context, args);
    }, delay);
  };
}
