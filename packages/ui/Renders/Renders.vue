<script setup lang="ts">
import RenderItem from "./RenderItem.vue";
import { RendersProps } from "./types";

defineOptions({ name: "Renders" });

defineProps<RendersProps>();
</script>

<template>
  <RenderItem
    v-for="item in config"
    :key="item.uuid"
    :config="item"
    :events="events"
    :data="data"
    :template="template"
  />
</template>
