<script setup lang="ts">
import { computed, CSSProperties, provide, useAttrs } from "vue";
import { gridContextKey, GridProps } from "./types";
import YFlex from "../Flex";

defineOptions({ name: "YGrid", inheritAttrs: false });

const props = defineProps<GridProps>();
const attrs = useAttrs();

const context = computed(() => {
  const { span, gutter = 0 } = props;
  return {
    span,
    gutter: (Array.isArray(gutter) ? gutter[0] : gutter) / 2,
  };
});

provide(gridContextKey, context);

const styles = computed<CSSProperties>(() => {
  const { gutter = 0 } = props;
  const isArray = Array.isArray(gutter);
  const g = isArray ? gutter[0] : gutter;
  const rowGap = isArray ? gutter[1] : 0;

  return { margin: `0 -${g / 2}px`, rowGap };
});
</script>

<template>
  <YFlex wrap :align="align" :justify="justify" :style="[attrs.style, styles]" :class="attrs.class">
    <slot />
  </YFlex>
</template>
