import { ComponentDefinition, ComponentRegistryItem } from "@agile-ui/ui";
import { reactive } from "vue";

export const DetailConfig = reactive<ComponentDefinition>({
  componentName: "YDetail",
  label: "详情组件",
  props: [
    { name: "items", type: "array", default: [], description: "配置列表" },
    { name: "data", type: "object", default: {}, description: "数据" },
    { name: "span", type: "number", default: 8, description: "栅格占据的列数" },
    { name: "hideItem", type: "string", description: "判断显示隐藏某一项" },
  ],
  slots: [
    { name: "label-{{item.key}}", description: "动态标题的插槽" },
    { name: "label-{{item.key}}", description: "动态内容的插槽" },
  ],
  template: {
    id: "f11bbb0a-c694-4b05-9c7e-068ff0f099c6",
    component: "YGrid",
    props: { gutter: 10, span: "{{props.span}}" },
    children: [
      {
        id: "d848b77e-9973-433f-91c5-c8a1b498b1dc",
        component: "YCol",
        loop: { key: "key", source: "{{props.items}}" },
        props: { push: "{{item.push}}", pull: "{{item.pull}}", offset: "{{item.offset}}", span: "{{item.span}}" },
        children: [
          {
            id: "1bf3b060-be38-4f0b-8bb0-3e6c925b9396",
            component: "YText",
            props: { text: "{{item.label}}" },
            children: [{ id: "01939eb2-1399-48bf-b747-f73b2933f837", component: "$slot:label-{{item.key}}" }],
          },
          {
            id: "2a6a75dd-b635-4093-8285-39e3689faaa9",
            component: "YText",
            props: { text: "{{props.data[item.key]}}" },
            children: [{ id: "daf47206-5d2e-4933-b18a-25127eab6040", component: "$slot:value-{{item.key}}" }],
          },
        ],
      },
    ],
  },
});

export const DetailRegistry = reactive<ComponentRegistryItem>({
  name: "YDetail",
  type: "composite",
  definition: DetailConfig,
});
