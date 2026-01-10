<script setup lang="ts" generic="T extends ElementType">
import { onBeforeUnmount, reactive, ref, StyleValue, watch } from "vue";
import { canvasDrag } from "../core";
import { ElementType, GuidesList, GuidesType, RectInfo } from "../types";
import { CanvasDragEmits, CanvasDragProps } from "./types";

defineOptions({ name: "CanvasDrag" });
const canvasRef = ref<HTMLElement>();

const props = defineProps<CanvasDragProps>();
/** 元素列表 */
const elements = defineModel<T[]>("elements", {
  default: () => [],
  required: true,
});
/** 选择的元素ids */
const selectIds = defineModel<string[]>("selectIds");

const emits = defineEmits<CanvasDragEmits<T>>();

/** 放大缩小的八个点 */
const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const { setElement, on, destroy } = canvasDrag<T>(() => canvasRef.value, {
  zoom: props.zoom,
  plugins: props.plugins,
});
watch(
  () => elements.value.length,
  () => {
    setElement(elements.value);
  },
  { immediate: true },
);

const data = reactive<{
  selectBox: RectInfo | null;
  selectBounds: RectInfo | null;
  guides: GuidesList;
  zoom: { zoom: number; x: number; y: number };
}>({
  selectBox: null,
  selectBounds: null,
  guides: [],
  zoom: { zoom: 1, x: 0, y: 0 },
});
on("select", (val) => {
  selectIds.value = val;
});
on("change", (list) => {
  elements.value.length = 0;
  elements.value.push(...list);
});
on("selectBox", (res) => {
  data.selectBox = res;
});
on("selectBounds", (res) => {
  data.selectBounds = res;
});
on("guides", (res) => {
  data.guides = res;
});
on("rotate", (elements, ids) => {
  emits("rotate", { elements, ids });
});
on("scale", (elements, ids) => {
  emits("scale", { elements, ids });
});
on("drag", (elements, ids) => {
  emits("drag", { elements, ids });
});
on("zoom", (res) => {
  data.zoom = res;
});

const getSnapLineStyle = (line: GuidesType): StyleValue => {
  return {
    position: "absolute",
    left: (line.type === "vertical" ? line.position : 0) + "px",
    top: (line.type === "horizontal" ? line.position : 0) + "px",
    width: line.type === "vertical" ? "1px" : "100%",
    height: line.type === "horizontal" ? "1px" : "100%",
    backgroundColor: "#ff00ff",
    zIndex: "9999",
    pointerEvents: "none",
  };
};

// 销毁
onBeforeUnmount(destroy);
</script>

<template>
  <div
    ref="canvasRef"
    :style="{
      transform: `translate(${data.zoom.x}px, ${data.zoom.y}px) scale(${data.zoom.zoom})`,
      transformOrigin: '0 0',
    }"
    data-drag-handle="canvas"
    class="canvas"
  >
    <div
      v-for="item in elements"
      :key="item.id"
      :data-element-id="item.id"
      data-drag-handle="drag"
      class="canvas__drag"
      :style="{
        ...item.style,
        width: `${item.width}px`,
        height: `${item.height}px`,
        left: `${item.left}px`,
        top: `${item.top}px`,
        transform: `rotate(${item.angle || 0}deg)`,
      }"
    >
      <slot :id="item.id" name="item" :item="item"></slot>
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
        data-drag-handle="scale"
        :data-drag-type="pos"
        :class="['handle-pos', pos]"
      >
        <slot name="pos">
          <div class="handle__rect"></div>
        </slot>
      </div>

      <div class="handle-rotate" data-drag-handle="rotate">
        <slot name="rotate">
          <div class="handle-rotate-line"></div>
        </slot>
      </div>
    </div>

    <div
      v-if="data.selectBox"
      class="select-group"
      :style="{
        top: `${data.selectBox.top}px`,
        left: `${data.selectBox.left}px`,
        width: `${data.selectBox.width}px`,
        height: `${data.selectBox.height}px`,
      }"
    >
      <slot name="select" :data="data.selectBox">
        <div class="select-group__rect"></div>
      </slot>
    </div>

    <div v-for="item in data.guides" :key="item.type" :style="getSnapLineStyle(item)"></div>
  </div>
</template>

<style lang="scss" scoped>
.canvas {
  position: relative;
  width: 700px;
  height: 600px;
  background: #ccc;

  &__drag {
    position: absolute;
  }
}
.handle {
  position: absolute;
  border: 1px solid #007bff;
  z-index: 999999999;
  box-sizing: border-box;

  &__rect {
    width: 9px;
    height: 9px;
    background-color: #fff;
    border: 1px solid #007bff;
    z-index: 10;
    border-radius: 50%;
    box-sizing: border-box;
  }

  &-pos {
    position: absolute;

    &.nw {
      transform: translate(-50%, -50%);
      cursor: nw-resize;
    }

    &.n {
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: n-resize;
    }

    &.ne {
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
      cursor: ne-resize;
    }

    &.e {
      top: 50%;
      right: 0px;
      transform: translate(50%, -50%);
      cursor: e-resize;
    }

    &.se {
      bottom: 0px;
      right: 0px;
      transform: translate(50%, 50%);
      cursor: se-resize;
    }

    &.s {
      bottom: 0px;
      left: 50%;
      transform: translate(-50%, 50%);
      cursor: s-resize;
    }

    &.sw {
      bottom: 0px;
      left: 0px;
      transform: translate(-50%, 50%);
      cursor: sw-resize;
    }

    &.w {
      top: 50%;
      left: 0px;
      transform: translate(-50%, -50%);
      cursor: w-resize;
    }
  }
}
.select-group {
  position: absolute;
  z-index: 9999999;
  &__rect {
    box-sizing: border-box;
    background-color: rgba(0, 123, 255, 0.2);
    border: 1px solid #007bff;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }
}
.handle-rotate {
  position: absolute;
  top: -25px;
  left: 50%;
  margin-left: -4px;
  width: 8px;
  height: 8px;
  background-color: #fff;
  border: 1px solid #007bff;
  border-radius: 50%;
  cursor: grab;
  z-index: 10;

  &-line {
    position: absolute;
    top: 8px;
    left: 3px;
    width: 1px;
    height: 17px;
    background-color: #007bff;
    pointer-events: none;
  }
}
</style>
