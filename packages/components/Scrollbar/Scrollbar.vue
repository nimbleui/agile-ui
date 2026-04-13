<script setup lang="ts">
import { ref, type ComponentPublicInstance } from "vue";
import Thumb from "./Thumb.vue";
import ResizeObserver, { type ResizeEvent, type ResizeEventParam } from "../ResizeObserver";
import type { ScrollbarProps, ScrollbarThumbInstance } from "./types";

defineOptions({ name: "Scrollbar" });
defineProps<ScrollbarProps>();
const emits = defineEmits<{
  (name: "scroll", e: Event): void;
  (name: "wheel", e: WheelEvent): void;
  (name: "resize", data: ResizeEventParam): void;
}>();

const thumbRef = ref<ComponentPublicInstance<ScrollbarThumbInstance>>();

const onContainerResize: ResizeEvent = (data) => {
  emits("resize", data);
  thumbRef.value?.update(data.el);
};

const onScroll = (e: Event) => {
  thumbRef.value?.handleScroll(e.target as HTMLElement);
  emits("scroll", e);
};
const onWheel = (e: WheelEvent) => {
  emits("wheel", e);
};

const mouseEnter = ref(false);
const onMouseenter = () => {
  mouseEnter.value = true;
};
const onMouseleave = () => {
  mouseEnter.value = false;
};
</script>

<template>
  <ResizeObserver class="scrollbar" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
    <ResizeObserver
      :as="as"
      :as-child="asChild"
      style="overflow: auto"
      class="scrollbar__content"
      @wheel="onWheel"
      @scroll="onScroll"
      @resize="onContainerResize"
    >
      <slot />
    </ResizeObserver>
    <div style="position: absolute; top: 0; right: 5px">
      <slot name="bar"></slot>
      <Thumb ref="thumbRef" is-vertical>
        <slot name="thumb"></slot>
      </Thumb>
    </div>
  </ResizeObserver>
</template>

<style lang="scss">
.scrollbar {
  position: relative;

  &__content {
    height: 100%;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
