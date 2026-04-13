<script setup lang="ts" generic="T">
import { onMounted, onUnmounted, ref, type ComponentPublicInstance } from "vue";
import Primitive from "../Primitive";
import type { ResizeEventParam, ResizeObserverProps } from "./types";

defineOptions({ name: "ResizeObserver" });

const props = defineProps<ResizeObserverProps<T>>();
const emits = defineEmits<{
  (type: "resize", data: ResizeEventParam): void;
}>();

const rootRef = ref<ComponentPublicInstance>();

/** 监听元素宽度变化 */
const ro = new ResizeObserver((entries) => {
  const entry = entries[0];
  const el = entry.target as HTMLElement;
  const { height, width } = entry.contentRect;
  emits("resize", { item: props.item, el, height, width });
});

onMounted(() => {
  if (rootRef.value?.$el) {
    ro.observe(rootRef.value.$el);
  }
});
onUnmounted(() => {
  ro.disconnect();
});
</script>

<template>
  <Primitive ref="rootRef" :as-child="asChild" :as="as">
    <slot :item="item"></slot>
  </Primitive>
</template>
