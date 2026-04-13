import { computed, reactive, watch } from "vue";
import type { VirtualListProps } from "./types";

function lowBit(n: number): number {
  return n & -n;
}

export function useItemHeights<T>(props: VirtualListProps<T> & { itemSize: number }) {
  // 记录每一项真实高度，key 为 itemKey
  const offsetHeight: Map<string | number, number> = new Map();
  // 计算累计偏差高度
  const cumulativeOffsetHeight = reactive<number[]>([]);
  // 索引映射
  const indexMap = computed(() => {
    const { items, itemKey } = props;
    const map = new Map();
    for (let i = 0; i < props.items.length; i++) {
      map.set(itemKey(items[i]), i);
    }
    return map;
  });
  // 将下标 i（从 0 开始）的元素增加 n，并更新所有受影响的树状数组节点
  function add(i: number, n: number) {
    if (n == 0) return;
    const len = props.items.length;
    i += 1; // 转换为从 1 开始的下标
    while (i <= len) {
      cumulativeOffsetHeight[i] += n;
      i += lowBit(i);
    }
  }
  // 计算总数
  function sum(i?: number): number {
    const len = props.items.length;
    if (i === undefined) i = len;
    if (i <= 0) return 0;
    if (i > len) throw new Error("`i` is larger than length.");
    let ret = i * props.itemSize; // 加上 min 偏移的基准部分
    while (i > 0) {
      ret += cumulativeOffsetHeight[i] ?? 0;
      i -= lowBit(i); // 去掉最低位的 1，跳到上一个区间
    }
    return ret;
  }

  function get(i: number) {
    return sum(i + 1) - sum(i);
  }

  watch(
    () => props.items,
    (val) => {
      const len = val.length;
      for (let i = 0; i < len + 1; i++) {
        cumulativeOffsetHeight[i] = 0;
        if (i === len) return;
        const el = val[i];
        const key: string | number = props.itemKey(el);
        const heightOffset = offsetHeight.get(key);
        if (heightOffset == null) continue;
        add(i, heightOffset);
      }
    },
    { immediate: true },
  );

  // 二分查找：返回最大的元素个数 k，使得前 k 个元素之和 <= threshold
  function getBound(threshold: number): number {
    let l = 0;
    let r = props.items.length;
    while (r > l) {
      const m = Math.floor((l + r) / 2);
      const sumM = sum(m);
      if (sumM > threshold) {
        r = m; // 前 m 个元素之和已超过阈值，缩小右边界
        continue;
      } else if (sumM < threshold) {
        if (l === m) {
          // l 与 m 相同时防止死循环，尝试 l+1
          if (sum(l + 1) <= threshold) return l + 1;
          return m;
        }
        l = m; // 前 m 个元素之和未达阈值，扩大左边界
      } else {
        return m; // 恰好等于阈值，直接返回
      }
    }
    return l;
  }

  return { add, get, sum, getBound, indexMap, offsetHeight };
}
