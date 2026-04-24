<template>
  <CanvasDrag :elements="data" :plugins="plugins">
    <template #item="{ item }">
      <div>{{ item.id }}</div>
    </template>
  </CanvasDrag>
</template>

<script setup lang="ts" generic="T extends ElementType">
import { CanvasDrag } from "@canvas-drag/vue";
import { ElementType } from "@canvas-drag/core";
import {
  collisionPlugin,
  dragCanvasPlugin,
  dragPlugin,
  rotatePlugin,
  scaleCanvasPlugin,
  scalePlugin,
  selectPlugin,
  smartGuidesPlugin,
} from "@canvas-drag/plugins";
import { CanvasDragProps } from "./types";

defineProps<CanvasDragProps<T>>();

const plugins = [
  rotatePlugin(),
  selectPlugin(),
  scalePlugin(),
  dragPlugin(true),
  smartGuidesPlugin(),
  collisionPlugin(),
  scaleCanvasPlugin(),
  dragCanvasPlugin(),
];
</script>

<style lang="scss" scoped></style>
