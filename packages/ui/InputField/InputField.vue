<script setup lang="ts">
import { computed, reactive } from "vue";
import { Render, type EventConfig, type ConfigList } from "../Render";
import { InputFieldProps } from "./types";

defineOptions({ name: "InputField" });

const props = defineProps<InputFieldProps>();

const data = reactive({});
const config = computed<ConfigList>(() => {
  return [
    {
      uuid: "1",
      component: "YField",
      props: { vertical: true, style: "box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 4px;" },
      on: { click: "click", change: "click" },
      children: [
        {
          uuid: "1-1",
          component: "YText",
          slotName: "label",
          props: { text: props.label },
        },
        {
          uuid: "2",
          component: "YInput",
          props: { type: "text", placeholder: props.placeholder },
        },
      ],
    },
  ];
});

const events: { [key: string]: EventConfig } = {
  click: {
    id: "1",
    name: "提交",
    type: "show_dialog",
    actions: [
      {
        id: "1-1",
        type: "api_call",
        conditions: [
          /** 校验必填项 */
          {
            id: "1-1-1",
            type: "expression",
            expression: "${data.name && data.email && data.phone}",
            message: "请填写完整信息",
          },
        ],
        params: {
          url: "",
          method: "GET",
          data: "${forms.orderForm}",
        },
        next: "1-2",
      },
      {
        id: "1-2",
        type: "show_message",
        params: {
          message: "提交成功！",
          duration: 2000,
        },
      },
    ],
  },
};
</script>

<template>
  <Render :data="data" :config="config" :slots="$slots" />
</template>
