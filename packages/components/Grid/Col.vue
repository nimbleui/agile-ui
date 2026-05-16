<script setup lang="ts">
import { computed, CSSProperties, inject } from "vue";
import { ColProps, gridContextKey } from "./types";

defineOptions({ name: "YCol" });
const gridContext = inject(gridContextKey, undefined);

const props = defineProps<ColProps>();

const style = computed<CSSProperties>(() => {
  const { span, offset = 0, pull = 0, push = 0 } = props;
  const col = 100 / 24;
  const width = `${col * (span || gridContext?.value.span || 24)}%`;
  const gutter = gridContext?.value.gutter;
  return {
    position: "relative",
    display: "block",
    maxWidth: width,
    flex: `0 0 ${width}`,
    marginLeft: `${col * offset}%`,
    right: `${col * pull}%`,
    left: `${col * push}%`,
    paddingLeft: gutter ? `${gutter}px` : undefined,
    paddingRight: gutter ? `${gutter}px` : undefined,
    boxSizing: "border-box",
  };
});
</script>

<template>
  <div :style="style">
    <slot />
  </div>
</template>
