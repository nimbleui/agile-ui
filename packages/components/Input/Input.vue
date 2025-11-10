<script setup lang="ts">
import type { InputProps } from "./types";

defineOptions({ name: "YInput" });
defineProps<InputProps>();
</script>

<template>
  <input :type="type || 'text'" />
</template>
