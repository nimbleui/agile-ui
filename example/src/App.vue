<script setup lang="ts">
import { ref } from "vue";
import { Dialog, InputField, DragCanvas } from "@agile-ui/ui";
import { CanvasDrag } from "@agile-ui/canvas-drag";

defineOptions({ name: "App" });
// const a = ref("222");
// setTimeout(() => {
//   a.value = "3333";
// }, 2000);
// const show = ref(false);
</script>

<template>
  <!-- <Dialog v-model:show="show" class="2222" :title="a">
    <div>2222</div>
    <div>内容33333</div>
  </Dialog>

  <InputField label="label text" placeholder="placeholder text" /> -->

  <DragCanvas />

  <CanvasDrag />
</template>
