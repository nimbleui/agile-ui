<template>
  <Render :slots="slots" :config="elements" :data="data"></Render>
</template>

<script setup lang="ts">
import { reactive, useAttrs, useSlots } from "vue";
import { Render } from "..";
import type { RenderComponentProps } from "./types";

defineOptions({ name: "RenderComponent", inheritAttrs: false });

const props = defineProps<RenderComponentProps>();

const slots = useSlots();
const attrs = useAttrs();

const data = reactive({});
</script>

<style lang="scss" scoped></style>
