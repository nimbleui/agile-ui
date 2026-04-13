<script setup lang="ts">
import { computed, ref, type CSSProperties } from "vue";
import Primitive from "../Primitive";
import { useMouse } from "./useMouse";
import type { ScrollbarThumbProps } from "./types";

defineOptions({ name: "ScrollbarThumb" });
const props = withDefaults(defineProps<ScrollbarThumbProps>(), {
  gap: 10,
});

const moveY = ref(0);
const moveX = ref(0);
const ratioY = ref(1);
const ratioX = ref(1);
const sizeWidth = ref("");
const sizeHeight = ref("");

const wrapRef = ref<HTMLElement | null>(null);
const { onDown } = useMouse(wrapRef, props);

const handleScroll = (wrap: HTMLElement) => {
  if (!wrap) return;

  update(wrap);
  const offsetHeight = wrap.offsetHeight;
  const offsetWidth = wrap.offsetWidth;

  moveY.value = ((wrap.scrollTop * 100) / offsetHeight) * ratioY.value;
  moveX.value = ((wrap.scrollLeft * 100) / offsetWidth) * ratioX.value;
};

const update = (wrap: HTMLElement) => {
  if (!wrap) return;
  wrapRef.value = wrap;
  const { offsetHeight, offsetWidth } = wrap;

  const originalHeight = offsetHeight ** 2 / wrap.scrollHeight;
  const originalWidth = offsetWidth ** 2 / wrap.scrollWidth;
  const height = Math.max(originalHeight, props.minSize || 20);
  const width = Math.max(originalWidth, props.minSize || 20);

  ratioX.value = originalWidth / (offsetWidth - originalWidth) / (width / (offsetWidth - width));
  ratioY.value = originalHeight / (offsetHeight - originalHeight) / (height / (offsetHeight - height));

  sizeWidth.value = width < offsetWidth ? `${width}px` : "";
  sizeHeight.value = height < offsetHeight ? `${height}px` : "";
};

const styleComp = computed<CSSProperties>(() => {
  const { isVertical } = props;
  return {
    zIndex: 99,
    position: "absolute",
    height: isVertical ? sizeHeight.value : "",
    width: !isVertical ? sizeWidth.value : "",
    [isVertical ? "top" : "left"]: 0,
    transform: `translate3d(${isVertical ? 0 : moveX.value}%, ${isVertical ? moveY.value : 0}%, 0)`,
  };
});

defineExpose({ handleScroll, update });
</script>

<template>
  <primitive as-child :style="styleComp" data-thumb @mousedown="onDown">
    <slot>
      <div></div>
    </slot>
  </primitive>
</template>
