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
    id: "dialog-container-1",
    component: "YContainer",
    props: { display: "block" },
    children: [
      {
        id: "dialog-mask-1",
        component: "YMask",
        children: [
          {
            id: "dialog-model-1",
            component: "YModel",
            children: [
              {
                id: "dialog-flex-1",
                component: "YFlex",
                props: { justify: "center", align: "center" },
                children: [
                  {
                    id: "dialog-text-1",
                    component: "YText",
                    props: { text: "{{props.title}}" },
                    children: [{ id: "dialog-slot-1", component: "$slot:title" }],
                  },
                  {
                    id: "dialog-close-1",
                    component: "YClose",
                  },
                ],
              },
              { id: "dialog-slot-1", component: "$slot:default" },
            ],
          },
        ],
      },
    ],
  },
});

export const DialogRegistry = reactive<ComponentRegistryItem>({
  name: "YDialog",
  type: "composite",
  definition: DialogConfig,
});
