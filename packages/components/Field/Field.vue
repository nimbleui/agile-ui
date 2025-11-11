<script setup lang="ts">
import { useAttrs } from "vue";
import { YContainer } from "../Container";
import type { FieldProps } from "./types";
import { useComponentAttrs } from "@agile-ui/hooks";

defineOptions({ name: "YField" });
defineProps<FieldProps>();
const attrs = useAttrs();
const { style, classNames } = useComponentAttrs(attrs);
</script>

<template>
  <YContainer :style="style" :class="classNames" :vertical="vertical" position="relative">
    <slot name="label" />
    <slot />
    <div style="position: absolute; bottom: -100%">
      <slot name="error" />
    </div>
  </YContainer>
</template>
