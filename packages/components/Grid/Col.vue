<script setup lang="ts">
import { computed, CSSProperties } from "vue";
import { ColProps } from "./types";

defineOptions({ name: "YCol" });

const props = defineProps<ColProps>();

const style = computed<CSSProperties>(() => {
  const { span = 24, offset = 0, pull = 0, push = 0 } = props;
  const col = 100 / 24;
  const width = `${col * span}%`;
  return {
    position: "relative",
    display: "block",
    maxWidth: width,
    flex: `0 0 ${width}`,
    marginLeft: `${col * offset}%`,
    right: `${col * pull}%`,
    left: `${col * push}%`,
  };
});
</script>

<template>
  <div :style="style">
    <slot />
  </div>
</template>
