<script setup lang="ts">
import type { RenderProps } from "./types";
import RenderItem from "./RenderItem.vue";

defineOptions({ name: "Render" });
defineProps<RenderProps>();
</script>

<template>
  <RenderItem v-for="item in config" :key="item.uuid" :data="data" :item="item" :slots="slots" :template="template" />
</template>
