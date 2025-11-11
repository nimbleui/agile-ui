<script setup lang="ts">
import { useComponentAttrs } from "@agile-ui/hooks";
import type { InputProps } from "./types";
import { useAttrs } from "vue";
import { YContainer } from "../Container";

defineOptions({ name: "YInput" });
defineProps<InputProps>();
const attrs = useAttrs();
const { style, classNames } = useComponentAttrs(attrs, {
  style: `background: transparent; border: none; outline: none;box-sizing: border-box; padding: 0px;`,
});
</script>

<template>
  <YContainer>
    <input :style="style" :type="type || 'text'" :class="classNames" :placeholder="placeholder" />
  </YContainer>
</template>
