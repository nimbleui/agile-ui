<script setup lang="ts">
import { reactive } from "vue";
import { ConfigTypes, RenderItem } from "@agile-ui/ui";
import {
  CanvasDrag,
  collisionPlugin,
  dragPlugin,
  rotatePlugin,
  scalePlugin,
  selectPlugin,
  smartGuidesPlugin,
  scaleCanvasPlugin,
  dragCanvasPlugin,
  type ElementType,
  type Plugin,
} from "@agile-ui/canvas-drag";

defineOptions({ name: "App" });
// const a = ref("222");
// setTimeout(() => {
//   a.value = "3333";
// }, 2000);
// const show = ref(false);
const elements = reactive<(ElementType & ConfigTypes)[]>([
  {
    component: "YInput",
    id: "1",
    width: 100,
    height: 100,
    left: 50,
    top: 50,
    angle: 45,
    disabled: true,
    style: { backgroundColor: "#ff5555" },
  },
  { component: "YInput", id: "2", width: 100, height: 100, left: 200, top: 200, style: { backgroundColor: "#5555ff" } },
  { component: "YInput", id: "3", width: 100, height: 100, left: 350, top: 350, style: { backgroundColor: "#55ff55" } },
  // { id: "4", width: 100, height: 100, left: 500, top: 500, style: { backgroundColor: "#55ff55" } },
]);

setTimeout(() => {
  elements.push({
    component: "YInput",
    id: "4",
    width: 100,
    height: 100,
    left: 500,
    top: 500,
    style: { backgroundColor: "#ffaa00" },
  });
}, 5000);

const data = reactive({});
const plugins: Plugin[] = [
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

<template>
  <CanvasDrag v-model:elements="elements" :plugins="plugins">
    <template #item="{ item }">
      <RenderItem :data="data" :item="item" />
    </template>
  </CanvasDrag>
</template>
