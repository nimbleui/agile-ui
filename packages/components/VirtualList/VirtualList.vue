<script lang="ts" setup generic="T extends Record<string, any>">
import { computed, ref } from "vue";
import type { VirtualListProps, VirtualScrollToOptions } from "./types";
import { useItemHeights } from "./useItemHeights";
import ResizeObserver, { type ResizeEvent } from "../ResizeObserver";
import Scrollbar from "../Scrollbar";

defineOptions({ name: "VirtualList" });

const props = withDefaults(defineProps<VirtualListProps<T>>(), {
  buffer: 4,
  itemSize: 10,
});
const emits = defineEmits<{
  (name: "scroll", e: Event): void;
}>();

// 容器 DOM 引用，用于获取滚动位置和高度
const containerRef = ref<HTMLElement | null>(null);
const containerHeight = ref(0);
// 当前滚动条距离顶部的距离
const scrollTopRef = ref(0);
const scrollLeftRef = ref(0);

const { add, get, sum, getBound, indexMap, offsetHeight } = useItemHeights(props);

const startIndex = computed(() => {
  return getBound(scrollTopRef.value);
});

const viewportItems = computed(() => {
  const height = containerHeight.value;
  if (!height) return [];

  const start = startIndex.value;
  const end = Math.min(start + Math.ceil(height / props.itemSize + 1), props.items.length - 1);
  const viewportItems: T[] = [];
  for (let i = start; i <= end; ++i) {
    viewportItems.push(props.items[i]);
  }
  return viewportItems;
});

// 获取滚动的位置
function syncViewport() {
  const container = containerRef.value;
  if (!container) return;

  scrollTopRef.value = container.scrollTop;
  scrollLeftRef.value = container.scrollLeft;
}

const onScroll = (e: Event) => {
  syncViewport();
  emits("scroll", e);
};

const handleItemResize: ResizeEvent<T> = ({ item, height }) => {
  const key = props.itemKey(item!);
  const index = indexMap.value.get(key);
  const previousHeight = get(index);

  if (height === previousHeight) return;

  const offset = height - props.itemSize;
  if (offset == 0) {
    offsetHeight.delete(key);
  } else {
    offsetHeight.set(key, offset);
  }

  const delta = height - previousHeight;
  if (delta == 0) return;
  add(index, delta);
  const previousHeightSum = sum(index);

  const container = containerRef.value;
  if (!container) return;
  if (anchorIndex == null) {
    if (container.scrollTop > previousHeightSum) {
      container.scrollBy(0, delta);
    }
  }
};

const onWheel = (e: WheelEvent) => {
  const container = containerRef.value;
  if (!container) return;
  const { scrollTop, offsetHeight, scrollHeight } = container;
  if (e.deltaX == 0) {
    if ((scrollTop == 0 && e.deltaY <= 0) || (scrollTop + offsetHeight >= scrollHeight && e.deltaY >= 0)) {
      return;
    }
  }
  e.preventDefault();
  container.scrollTop += e.deltaY;
};

const containerResize: ResizeEvent = ({ el, height }) => {
  containerRef.value = el;
  containerHeight.value = height;
};

function scrollToPosition(left: number | undefined, top: number | undefined, behavior: ScrollToOptions["behavior"]) {
  containerRef.value?.scrollTo({ left, top, behavior });
}

let anchorIndex: number | null;
const scrollTo = (options: VirtualScrollToOptions | number, y?: number) => {
  if (typeof options === "number") {
    return scrollToPosition(options, y, "auto");
  }

  const { left, top, index, key, position, behavior } = options;

  let targetTop: number = 0;
  if (top != null) {
    targetTop = top;
  } else if (position == "bottom") {
    targetTop = Number.MAX_SAFE_INTEGER;
    anchorIndex = props.items.length - 1;
  } else if (position == "top") {
    targetTop = 0;
    anchorIndex = 0;
  } else if (index != null) {
    targetTop = sum(index);
    anchorIndex = index;
  } else if (key != null) {
    const index = indexMap.value.get(key);
    targetTop = sum(index);
    anchorIndex = index;
  }
  scrollToPosition(left, targetTop, behavior);
};
defineExpose({ scrollTo });
</script>

<template>
  <!-- 外层滚动容器：设置 overflow-y: auto 开启纵向滚动 -->
  <Scrollbar style="height: 100%" @scroll="onScroll" @wheel="onWheel" @resize="containerResize">
    <!-- 占位容器：高度为整个列表总高度，用来生成滚动条 -->
    <div :style="{ height: sum() + 'px', position: 'relative' }">
      <!-- 实际渲染区域：通过 translateY 把可视区内容移动到正确位置 -->
      <div :style="{ transform: `translateY(${sum(startIndex)}px)` }">
        <ResizeObserver
          v-for="item in viewportItems"
          :key="props.itemKey(item)"
          :as="as"
          :item="item"
          :as-child="asChild"
          @resize="handleItemResize"
        >
          <slot :item="item" />
        </ResizeObserver>
      </div>
    </div>

    <template #thumb>
      <slot name="thumb"></slot>
    </template>
  </Scrollbar>
</template>
