<script setup lang="ts">
import { reactive, ref } from "vue";
import { canvasDrag } from "../code";
import { ElementType } from "../types";
import { dragPlugin } from "../plugins";

defineOptions({ name: "CanvasDrag" });
const canvasRef = ref<HTMLElement>();

const elements = reactive<ElementType[]>([
  { id: "1", width: 100, height: 100, left: 50, top: 50, style: { backgroundColor: "#ff5555" } },
  { id: "2", width: 100, height: 100, left: 200, top: 200, style: { backgroundColor: "#5555ff" } },
  { id: "3", width: 100, height: 100, left: 350, top: 350, style: { backgroundColor: "#55ff55" } },
  { id: "4", width: 100, height: 100, left: 500, top: 500, style: { backgroundColor: "#55ff55" } },
]);

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const { addElement } = canvasDrag(() => canvasRef.value, {
  elements,
  keyCode: "altKey",
  plugins: [dragPlugin],
});
addElement(elements);
</script>

<template>
  <div ref="canvasRef" data-drag-handle="canvas" class="canvas">
    <div
      v-for="item in elements"
      :key="item.id"
      :data-element-id="item.id"
      data-drag-handle="drag"
      :style="{
        ...item.style,
        width: `${item.width}px`,
        height: `${item.height}px`,
        left: `${item.left}px`,
        top: `${item.top}px`,
      }"
    >
      <slot :item="item"> 2222 </slot>
    </div>

    <div class="handle">
      <div
        v-for="pos in handles"
        :key="pos"
        data-drag-handle="size"
        :data-drag-type="pos"
        :class="['handle', 'handle-' + pos]"
      ></div>

      <div class="handle-rotate" data-drag-handle="rotate">
        <div class="handle-rotate-line"></div>
      </div>
    </div>

    <div data-drag-handle="group" class=""></div>
  </div>
</template>

<style lang="scss" scoped>
.canvas {
  position: relative;
  width: 700px;
  height: 600px;
  background: #ccc;

  div {
    position: absolute;
  }
}
</style>
