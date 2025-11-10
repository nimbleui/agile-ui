<script setup lang="ts">
import { Dialog, InputField } from "@agile-ui/ui";
import { ref } from "vue";

defineOptions({ name: "App" });
const a = ref("222");
setTimeout(() => {
  a.value = "3333";
}, 2000);
const show = ref(false);
</script>

<template>
  <Dialog v-model:show="show" class="2222" :title="a">
    <div>2222</div>
    <div>内容33333</div>
  </Dialog>

  <InputField></InputField>
</template>
