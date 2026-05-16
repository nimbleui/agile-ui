<script setup lang="ts">
import { computed, CSSProperties, useAttrs } from "vue";
import { FlexProps } from "./types";

defineOptions({ name: "YFlex", inheritAttrs: false });
const props = defineProps<FlexProps>();

const styles = computed<CSSProperties>(() => {
  const { align, justify, inline, wrap, vertical, size = 0 } = props;
  return {
    display: inline ? "inline-flex" : "flex",
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? "wrap" : "nowrap",
    flexDirection: vertical ? "column" : "row",
    gap: typeof size == "number" ? `${size}px` : size.join("px ").trim(),
  };
});

const attrs = useAttrs() as Record<string, any>;
</script>

<template>
  <div :style="[attrs.style, styles]" :class="attrs.class">
    <slot />
  </div>
</template>
