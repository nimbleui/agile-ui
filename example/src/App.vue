<script setup lang="ts">
import { ref } from "vue";
import { Dialog, InputField, DragCanvas } from "@agile-ui/ui";
import { CanvasDrag, type ElementType } from "@agile-ui/canvas-drag";

defineOptions({ name: "App" });
// const a = ref("222");
// setTimeout(() => {
//   a.value = "3333";
// }, 2000);
// const show = ref(false);
const elements = ref<ElementType[]>([
  { id: "1", width: 100, height: 100, left: 50, top: 50, angle: 45, style: { backgroundColor: "#ff5555" } },
  { id: "2", width: 100, height: 100, left: 200, top: 200, style: { backgroundColor: "#5555ff" } },
  { id: "3", width: 100, height: 100, left: 350, top: 350, style: { backgroundColor: "#55ff55" } },
  // { id: "4", width: 100, height: 100, left: 500, top: 500, style: { backgroundColor: "#55ff55" } },
]);
const onDrag = () => {
  console.log(222);
};
</script>

<template>
  <!-- <Dialog v-model:show="show" class="2222" :title="a">
    <div>2222</div>
    <div>内容33333</div>
  </Dialog>

  <InputField label="label text" placeholder="placeholder text" /> -->

  <DragCanvas />
  <CanvasDrag v-model:elements="elements" @drag="onDrag" />
</template>
