<script setup lang="ts">
import { reactive, ref } from "vue";
import { canvasDrag } from "../code";
import { ElementType, RectInfo } from "../types";
import { dragPlugin, selectPlugin } from "../plugins";

defineOptions({ name: "CanvasDrag" });
const canvasRef = ref<HTMLElement>();

const elements = ref<ElementType[]>([
  { id: "1", width: 100, height: 100, left: 50, top: 50, angle: 45, style: { backgroundColor: "#ff5555" } },
  { id: "2", width: 100, height: 100, left: 200, top: 200, style: { backgroundColor: "#5555ff" } },
  { id: "3", width: 100, height: 100, left: 350, top: 350, style: { backgroundColor: "#55ff55" } },
  { id: "4", width: 100, height: 100, left: 500, top: 500, style: { backgroundColor: "#55ff55" } },
]);

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const { addElement, on } = canvasDrag(() => canvasRef.value, {
  elements: elements.value,
  keyCode: "altKey",
  plugins: [dragPlugin, selectPlugin],
});
addElement(elements.value);

const data = reactive<{ selectBox: RectInfo | null; selectBounds: RectInfo | null }>({
  selectBox: null,
  selectBounds: null,
});
on("change", (list) => {
  elements.value = list;
});
on("selectBox", (res) => {
  data.selectBox = res;
});
on("selectBounds", (res) => {
  data.selectBounds = res;
});
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
        transform: `rotate(${item.angle || 0}deg)`,
      }"
    >
      <slot :item="item"> 2222 </slot>
    </div>

    <div
      v-if="data.selectBounds"
      class="handle"
      data-drag-handle="drag"
      :style="{
        top: `${data.selectBounds.top}px`,
        left: `${data.selectBounds.left}px`,
        width: `${data.selectBounds.width}px`,
        height: `${data.selectBounds.height}px`,
        transform: `rotate(${data.selectBounds.angle || 0}deg)`,
      }"
    >
      <div
        v-for="pos in handles"
        :key="pos"
        data-drag-handle="size"
        :data-drag-type="pos"
        :class="['handle-pos', pos]"
      ></div>

      <div class="handle-rotate" data-drag-handle="rotate">
        <div class="handle-rotate-line"></div>
      </div>
    </div>

    <div
      v-if="data.selectBox"
      data-drag-handle="group"
      class="group"
      :style="{
        top: `${data.selectBox.top}px`,
        left: `${data.selectBox.left}px`,
        width: `${data.selectBox.width}px`,
        height: `${data.selectBox.height}px`,
      }"
    ></div>
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
.handle {
  position: absolute;
  border: 1px solid #007bff;
  z-index: 999999999;
  box-sizing: border-box;

  &-pos {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: #fff;
    border: 1px solid #007bff;
    z-index: 10;

    &.nw {
      top: -4px;
      left: -4px;
      cursor: nw-resize;
    }

    &.n {
      top: -4px;
      left: 50%;
      margin-left: -4px;
      cursor: n-resize;
    }

    &.ne {
      top: -4px;
      right: -4px;
      cursor: ne-resize;
    }

    &.e {
      top: 50%;
      right: -4px;
      margin-top: -4px;
      cursor: e-resize;
    }

    &.se {
      bottom: -4px;
      right: -4px;
      cursor: se-resize;
    }

    &.s {
      bottom: -4px;
      left: 50%;
      margin-left: -4px;
      cursor: s-resize;
    }

    &.sw {
      bottom: -4px;
      left: -4px;
      cursor: sw-resize;
    }

    &.w {
      top: 50%;
      left: -4px;
      margin-top: -4px;
      cursor: w-resize;
    }
  }
}
.group {
  position: absolute;
  box-sizing: border-box;
  background-color: rgba(0, 123, 255, 0.2);
  border: 1px solid #007bff;
  pointer-events: none;
  z-index: 99999;
}
</style>
