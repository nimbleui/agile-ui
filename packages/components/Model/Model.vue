<script setup lang="ts">
import { computed, CSSProperties, watch } from "vue";
import { ModelProps } from "./types";
// import { multiTween } from "./animate";

defineOptions({ name: "YModel" });

const props = defineProps<ModelProps>();

const styles = computed<CSSProperties>(() => {
  return {};
});

// multiTween;

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      console.log(1111);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div :style="styles">
    <slot />
  </div>
</template>
