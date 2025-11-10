<script setup lang="ts">
import { TextProps } from "./types";

defineOptions({ name: "YText" });

const props = defineProps<TextProps>();
console.log(props.text);
</script>

<template>
  <component :is="target || 'span'">
    <slot>{{ text }}</slot>
  </component>
</template>
