<script setup lang="ts">
import { computed, reactive } from "vue";
import { Render, type ConfigList } from "../Render";

defineOptions({ name: "InputField" });

const data = reactive({});

const config = computed<ConfigList>(() => {
  return [
    {
      uuid: "1",
      component: "YField",
      props: { vertical: true },
      children: [
        {
          uuid: "1-1",
          component: "YText",
          slotName: "label",
          props: { text: "Input Label" },
        },
        {
          uuid: "2",
          component: "YInput",
          props: { type: "text", placeholder: "Enter text" },
        },
      ],
    },
  ];
});
</script>

<template>
  <Render :data="data" :config="config" :slots="$slots" />
</template>
