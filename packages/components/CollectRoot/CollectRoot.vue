<script setup lang="ts">
import type { CollectRootProps } from "./types";

defineOptions({ name: "YCollectRoot" });
defineProps<CollectRootProps>();
</script>

<template>
  <slot />
</template>
