import { defineComponent, h } from "vue";
import Slot from "./Slot";

const SELF_CLOSING_TAGS = ["area", "img", "input"];

export interface PrimitiveProps {
  /** 将默认渲染的元素更改为传递的子元素，合并它们的属性和行为 */
  asChild?: boolean;
  /** 此组件应渲染为元素或组件，可被 `asChild` 覆盖 */
  as?: string;
}

export default defineComponent({
  name: "Primitive",
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    as: {
      type: [String, Object],
      default: "div",
    },
  },
  setup(props, { attrs, slots }) {
    const asTag = props.asChild ? "template" : props.as;

    if (typeof asTag === "string" && SELF_CLOSING_TAGS.includes(asTag)) {
      return () => h(asTag, attrs);
    }

    if (asTag !== "template") {
      return () => h(props.as, attrs, { default: slots.default });
    }

    // asChild => 使用 Slot 转发所有 props/ref
    return () => h(Slot, attrs, { default: slots.default });
  },
});
