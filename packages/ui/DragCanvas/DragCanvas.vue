<template>
  <div ref="container" class="drag-canvas" :style="{ width: width + 'px', height: height + 'px' }">
    <div
      v-for="element in elements"
      :key="element.id"
      class="drag-element"
      :data-element-id="element.id"
      :style="getElementStyle(element)"
    >
      <!-- Content -->
      <div class="element-content">
        <div
          v-if="element.type === 'rect'"
          :style="{ backgroundColor: element.style?.backgroundColor || '#ccc', width: '100%', height: '100%' }"
        ></div>
        <span v-else-if="element.type === 'text'">{{ element.content || "Text" }}</span>
      </div>

      <!-- Handles -->
      <template v-if="element.selected && selectedIds.length === 1">
        <div v-for="pos in handles" :key="pos" :data-drag-handle="pos" :class="['handle', 'handle-' + pos]"></div>

        <!-- Rotation Handle -->
        <div class="handle-rotate" data-drag-handle="rotate">
          <div class="handle-rotate-line"></div>
        </div>
      </template>
    </div>

    <!-- Group Selection Bounds -->
    <div
      v-if="selectedIds.length > 1 && selectionBounds"
      class="group-handles"
      data-drag-group="true"
      :style="getGroupStyle(selectionBounds)"
    >
      <div class="handle-rotate" data-drag-handle="rotate">
        <div class="handle-rotate-line"></div>
      </div>
    </div>

    <!-- Selection Box -->
    <div v-if="selectionBox" class="selection-box" :style="getSelectionBoxStyle(selectionBox)"></div>

    <!-- Snap Lines -->
    <template v-for="(line, i) in snapLines" :key="'snap-' + i">
      <div class="snap-line" :style="getSnapLineStyle(line)"></div>
      <div v-if="line.distance !== undefined" class="snap-label" :style="getSnapLabelStyle(line)">
        {{ line.distance }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, PropType } from "vue";
import { CanvasController } from "./CanvasController";
import { ElementState, SnapLine } from "./types";

export default defineComponent({
  name: "DragCanvas",
  props: {
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 },
  },
  setup(props) {
    const container = ref<HTMLElement | null>(null);
    const controller = ref<CanvasController | null>(null);
    const elements = ref<ElementState[]>([]);
    const snapLines = ref<SnapLine[]>([]);
    const selectedIds = ref<string[]>([]);
    const selectionBounds = ref<any>(null);
    const selectionBox = ref<any>(null);
    const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

    const updateElements = (els: ElementState[]) => {
      elements.value = [...els];
      if (controller.value) {
        selectionBounds.value = controller.value.getSelectionBounds();
      }
    };

    const updateSnapLines = (lines: SnapLine[]) => {
      snapLines.value = [...lines];
    };

    const updateSelection = (ids: string[]) => {
      selectedIds.value = ids;
      if (controller.value) {
        selectionBounds.value = controller.value.getSelectionBounds();
      }
    };

    const updateSelectionBox = (box: any) => {
      selectionBox.value = box;
    };

    onMounted(() => {
      if (container.value) {
        const ctrl = new CanvasController({ width: props.width, height: props.height });
        ctrl.init(container.value);
        controller.value = ctrl;
        elements.value = ctrl.getElements();

        ctrl.on("change", updateElements);
        ctrl.on("snapLines", updateSnapLines);
        ctrl.on("selectionChange", updateSelection);
        ctrl.on("selectionBox", updateSelectionBox);
      }
    });

    onBeforeUnmount(() => {
      if (controller.value) {
        controller.value.off("change", updateElements);
        controller.value.off("snapLines", updateSnapLines);
        controller.value.off("selectionChange", updateSelection);
        controller.value.off("selectionBox", updateSelectionBox);
        controller.value.destroy();
      }
    });

    const getElementStyle = (element: ElementState) => {
      return {
        position: "absolute",
        left: element.x + "px",
        top: element.y + "px",
        width: element.width + "px",
        height: element.height + "px",
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        border: element.selected ? "2px solid #007bff" : "1px solid transparent",
        cursor: "move",
        ...element.style,
      };
    };

    const getSnapLineStyle = (line: SnapLine) => {
      return {
        position: "absolute",
        left: (line.type === "vertical" ? line.position : line.start) + "px",
        top: (line.type === "horizontal" ? line.position : line.start) + "px",
        width: (line.type === "vertical" ? 1 : line.end - line.start) + "px",
        height: (line.type === "horizontal" ? 1 : line.end - line.start) + "px",
        backgroundColor: "#ff00ff",
        zIndex: 9999,
        pointerEvents: "none",
      };
    };

    const getSnapLabelStyle = (line: SnapLine) => {
      const left = line.type === "vertical" ? line.position + 5 : (line.start + line.end) / 2;
      const top = line.type === "horizontal" ? line.position + 5 : (line.start + line.end) / 2;
      const transform = line.type === "vertical" ? "translate(0, -50%)" : "translate(-50%, 0)";

      return {
        position: "absolute",
        left: left + "px",
        top: top + "px",
        transform,
        backgroundColor: "#ff00ff",
        color: "white",
        fontSize: "10px",
        padding: "2px 4px",
        borderRadius: "2px",
        zIndex: 10000,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      };
    };

    const getGroupStyle = (bounds: any) => {
      return {
        position: "absolute",
        left: bounds.x + "px",
        top: bounds.y + "px",
        width: bounds.width + "px",
        height: bounds.height + "px",
        border: "1px dashed #007bff",
        pointerEvents: "all",
        cursor: "move",
        backgroundColor: "transparent",
        zIndex: 1000,
      };
    };

    const getSelectionBoxStyle = (box: any) => {
      return {
        position: "absolute",
        left: box.x + "px",
        top: box.y + "px",
        width: box.width + "px",
        height: box.height + "px",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        border: "1px solid #007bff",
        pointerEvents: "none",
        zIndex: 9999,
      };
    };

    return {
      container,
      elements,
      snapLines,
      selectedIds,
      selectionBounds,
      selectionBox,
      handles,
      getElementStyle,
      getSnapLineStyle,
      getSnapLabelStyle,
      getGroupStyle,
      getSelectionBoxStyle,
    };
  },
});
</script>

<style scoped>
.drag-canvas {
  position: relative;
  background-color: #f0f0f0;
  overflow: hidden;
  border: 1px solid #ccc;
}
.drag-element {
  box-sizing: border-box;
}
.element-content {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #fff;
  border: 1px solid #007bff;
  z-index: 10;
}
.handle-nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}
.handle-n {
  top: -4px;
  left: 50%;
  margin-left: -4px;
  cursor: n-resize;
}
.handle-ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}
.handle-e {
  top: 50%;
  right: -4px;
  margin-top: -4px;
  cursor: e-resize;
}
.handle-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}
.handle-s {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
  cursor: s-resize;
}
.handle-sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}
.handle-w {
  top: 50%;
  left: -4px;
  margin-top: -4px;
  cursor: w-resize;
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
}
.handle-rotate-line {
  position: absolute;
  top: 8px;
  left: 3px;
  width: 1px;
  height: 17px;
  background-color: #007bff;
  pointer-events: none;
}
.group-handles .handle-rotate {
  pointer-events: auto;
}
</style>
