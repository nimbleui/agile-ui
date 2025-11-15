<script setup lang="ts">
import { useAttrs } from "vue";
import { useComponentAttrs } from "@agile-ui/hooks";
import type { InputProps } from "./types";

defineOptions({ name: "YInput", inheritAttrs: false });
defineProps<InputProps>();
const emits = defineEmits<{ (name: "change", event: Event): void }>();

const model = defineModel({
  type: String,
  default: "",
});

const attrs = useAttrs();
const { style, classNames } = useComponentAttrs(attrs, {
  style: `background: transparent; border: none; outline: none;box-sizing: border-box; padding: 0px;`,
});

const onChange = (event: Event) => {
  emits("change", event as Event);
  const el = event.target as HTMLInputElement;
  model.value = el.value;
};
</script>

<template>
  <input :style="style" :type="type || 'text'" :class="classNames" :placeholder="placeholder" @input="onChange" />
</template>
