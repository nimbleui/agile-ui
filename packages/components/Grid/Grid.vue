<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import { GridProps } from "./types";

defineOptions({ name: "YGrid" });

const props = defineProps<GridProps>();

const style = computed<CSSProperties>(() => {
  const gutter = props.gutter || 0;
  return {
    display: "flex",
    flexWrap: "wrap",
    position: "relative",
    boxSizing: "border-box",
    gap: typeof gutter == "number" ? `${gutter}px` : gutter.join("px ").trim(),
  };
});
</script>

<template>
  <div class="y-grid" :style="style">
    <slot />
  </div>
</template>
