<script setup lang="ts">
import type { ButtonProps } from "./types";

defineOptions({ name: "YButton" });

defineProps<ButtonProps>();
</script>

<template>
  <button>
    <slot></slot>
  </button>
</template>
