<script setup lang="ts">
import Primitive from "../Primitive";
import { TextProps } from "./types";

defineOptions({ name: "YText" });

withDefaults(defineProps<TextProps>(), {
  as: "span",
});
</script>

<template>
  <primitive :as="as" :as-child="asChild">
    <slot>{{ text }}</slot>
  </primitive>
</template>
