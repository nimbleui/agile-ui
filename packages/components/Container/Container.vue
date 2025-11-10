<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { ContainerProps } from "./types";

defineOptions({ name: "YContainer" });

const props = withDefaults(defineProps<ContainerProps>(), {
  display: "flex",
});

const styles = computed(() => {
  const style: HTMLAttributes["style"] = {
    display: props.display,
    alignItems: props.align,
    position: props.position,
    justifyContent: props.justify,
  };

  if (props.vertical) style.flexDirection = "column";
  if (props.wrap) style.flexWrap = "wrap";
  if (props.flex) style.flex = props.flex;
  if (props.zIndex) style.zIndex = props.zIndex;

  return style;
});
</script>

<template>
  <div :style="styles">
    <slot />
  </div>
</template>
