import { reactive } from "vue";
import { type RenderComponentProps } from "@agile-ui/ui";

export const config: RenderComponentProps = reactive({
  elements: [
    {
      id: "222",
      component: "YContainer",
    },
  ],
});
