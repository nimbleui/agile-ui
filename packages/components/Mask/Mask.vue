<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import type { MaskProps } from "./types";

defineOptions({ name: "YMask" });
defineProps<MaskProps>();

const styles = computed(() => {
  const style: HTMLAttributes["style"] = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "auto",
    background: "rgba(0,0,0,0.5)",
  };
  return style;
});
</script>

<template>
  <div :style="styles">
    <slot />
  </div>
</template>
