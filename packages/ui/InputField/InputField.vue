<script setup lang="ts">
import { computed, reactive } from "vue";
import { Render, type EventConfig, type ConfigList } from "../Render";
import { InputFieldProps } from "./types";

defineOptions({ name: "InputField" });

const props = defineProps<InputFieldProps>();
const emits = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const data = reactive<any>({
  value: "3333",
  data: { a: "33333lll" },
});
const config = computed<ConfigList>(() => {
  return [
    {
      uuid: "1",
      component: "YField",
      props: { vertical: true, style: "box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 4px;" },
      // on: { click: "saveInfo" },
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
          model: { modelValue: "data.value", a: "data.data.a" },
          // on: { change: "inputChange" },
        },
        {
          uuid: "3",
          component: "YClose",
          show: "${!!data.value}",
          on: { click: "clear" },
        },
      ],
    },
  ];
});

const events: { [key: string]: EventConfig } = {
  saveInfo: {
    id: "",
    type: "",
    actions: [
      {
        id: "1-1",
        type: "api_call",
        desc: "提交表单",
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
        desc: "显示提交成功信息",
        params: {
          message: "提交成功！",
          duration: 2000,
        },
      },
    ],
  },
  inputChange: {
    id: "",
    type: "",
    actions: [
      {
        id: "2-1",
        type: "execute_code",
        desc: "更新输入值到data",
        params: {
          code: "${data.value = event.target.value}",
        },
      },
    ],
  },
  clear: {
    id: "",
    type: "",
    actions: [
      {
        id: "2-1",
        type: "execute_code",
        desc: "清空输入框",
        params: {
          code: "${data.value = ''}",
        },
      },
    ],
  },
};

const options = computed(() => {
  return { data, props, emits };
});
</script>

<template>
  {{ data.value }}
  <Render :data="options" :config="config" :slots="$slots" :events="events" />
</template>
