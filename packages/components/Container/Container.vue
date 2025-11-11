<script setup lang="ts">
import { computed, useAttrs, type HTMLAttributes } from "vue";
import { ContainerProps } from "./types";

defineOptions({ name: "YContainer" });

const props = withDefaults(defineProps<ContainerProps>(), {
  display: "flex",
});
const attrs = useAttrs();
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

  return [style, attrs.style as any];
});
</script>

<template>
  <div :style="styles" :class="attrs.class">
    <slot />
  </div>
</template>
