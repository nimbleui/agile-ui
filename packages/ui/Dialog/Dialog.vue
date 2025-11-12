<script setup lang="ts">
import { computed, reactive, useAttrs } from "vue";
import { Render, type ConfigList } from "../Render";

defineOptions({ name: "YDialog", inheritAttrs: false });

const attrs = useAttrs();
console.log(attrs);
const data = reactive({
  show: true,
});

const template = {
  show: "{{data.show}}",
};

const config = computed<ConfigList>(() => {
  return [
    {
      uuid: "2",
      component: "YMask",
    },
    {
      uuid: "3",
      component: "YContainer",
      props: { vertical: true, justify: "center", position: "relative" },
      show: "${data.show.aa}",
      showType: "if",
      children: [
        {
          uuid: "4",
          component: "YContainer",
          props: { align: "center", justify: "center", position: "relative" },
          children: [
            {
              uuid: "5",
              component: "YText",
              slots: { default: "title" },
              props: { target: "span", text: attrs.title as string },
            },
            {
              uuid: "6",
              component: "YClose",
              props: { position: "absolute" },
            },
          ],
        },
        {
          uuid: "7",
          component: "YContainer",
          slots: { default: "default" },
          props: { display: "block" },
        },
      ],
    },
  ];
});
</script>

<template>
  <Render :data="data" :template="template" :config="config" :slots="$slots" />
</template>
