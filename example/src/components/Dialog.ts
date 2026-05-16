import { ComponentDefinition, ComponentRegistryItem } from "@agile-ui/ui";
import { reactive } from "vue";

export const DialogConfig = reactive<ComponentDefinition>({
  componentName: "Dialog",
  label: "弹窗组件",
  slots: [
    { name: "title", description: "标题插槽" },
    { name: "default", description: "内容插槽" },
  ],
  props: [
    { name: "title", type: "string", default: "标题", description: "弹窗组件的标题" },
    { name: "width", type: "string", default: "40%", description: "弹窗组件的宽度" },
  ],
  template: {
    id: "container-1",
    component: "YContainer",
  },
});

export const DialogRegistry = reactive<ComponentRegistryItem>({
  name: "YDetail",
  type: "composite",
  definition: DialogConfig,
});
