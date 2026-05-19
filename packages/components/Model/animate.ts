/**
 * 缓动函数类型
 * @param t 当前进度 (0~1)
 * @returns 缓动后的进度值 (0~1)
 */
type EasingFunction = (t: number) => number;

/**
 * 动画配置选项
 */
interface AnimationOptions {
  /** 动画持续时间 (毫秒) */
  duration: number;
  /** 每帧更新回调，progress 为经过缓动处理后的进度 (0~1) */
  onUpdate: (progress: number) => void;
  /** 动画完成回调 */
  onComplete?: () => void;
  /** 缓动函数，默认 easeInOutQuad */
  easing?: EasingFunction;
}

/**
 * 动画控制器，可用于中途停止动画
 */
interface AnimationController {
  /** 停止动画 (不会触发 onComplete) */
  stop: () => void;
}

/**
 * 内置缓动函数集合
 */
const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
};

/**
 * 启动一个动画
 * @param options 动画配置
 * @returns 动画控制器，可调用 .stop() 中途停止
 */
export function animate(options: AnimationOptions): AnimationController {
  const { duration, onUpdate, onComplete, easing = Easing.easeInOutQuad } = options;

  let startTime: number | null = null;
  let rafId: number | null = null;

  const step = (timestamp: number) => {
    if (startTime === null) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(rawProgress);

    onUpdate(easedProgress);

    if (rawProgress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      // 动画完成
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(step);

  return {
    stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}

/**
 * 单属性补间动画
 * @param options.from 起始值
 * @param options.to 结束值
 * @param options.duration 持续时间（ms）
 * @param options.onUpdate 接收当前值
 * @param options.easing 缓动函数
 * @param options.onComplete 完成回调
 */
export function tween(options: {
  from: number;
  to: number;
  duration: number;
  onUpdate: (value: number) => void;
  easing?: EasingFunction;
  onComplete?: () => void;
}): AnimationController {
  const { from, to, duration, onUpdate, easing, onComplete } = options;

  return animate({
    duration,
    easing,
    onUpdate: (progress) => {
      const current = from + (to - from) * progress;
      onUpdate(current);
    },
    onComplete,
  });
}

// 使用示例：缩放
// tween({
//   from: 1,
//   to: 2.5,
//   duration: 600,
//   easing: Easing.easeOutQuad,
//   onUpdate: (scale) => {
//     element.style.transform = `scale(${scale})`;
//   },
// });

export function multiTween(
  props: {
    [key: string]: { from: number; to: number };
  },
  duration: number,
  onUpdate: (values: Record<string, number>) => void,
  easing?: EasingFunction,
): AnimationController {
  return animate({
    duration,
    easing,
    onUpdate: (progress) => {
      const values: Record<string, number> = {};
      for (const key in props) {
        const { from, to } = props[key];
        values[key] = from + (to - from) * progress;
      }
      onUpdate(values);
    },
  });
}

// // 示例：同时控制缩放和位移
// const controller = multiTween(
//   {
//     x: { from: 0, to: 200 },
//     y: { from: 0, to: 100 },
//     scale: { from: 1, to: 2 },
//     opacity: { from: 1, to: 0.5 },
//   },
//   1000,
//   ({ x, y, scale, opacity }) => {
//     element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
//     element.style.opacity = String(opacity);
//   },
//   Easing.easeInOutQuad,
// );
