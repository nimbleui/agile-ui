import { cloneVNode, Comment, defineComponent, Fragment, mergeProps, type VNode } from "vue";

function renderSlotFragments(children?: VNode[]): VNode[] {
  if (!children) return [];
  return children.flatMap((child) => {
    if (child.type === Fragment) return renderSlotFragments(child.children as VNode[]);
    return [child];
  });
}

export default defineComponent({
  name: "PrimitiveSlot",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      if (!slots.default) return null;

      const children = renderSlotFragments(slots.default());
      const index = children.findIndex((child) => child.type !== Comment);
      if (index === -1) return children;

      const firstChild = children[index];

      const mergedProps = firstChild.props ? mergeProps(attrs, firstChild.props) : attrs;

      const cloned = cloneVNode(firstChild, mergedProps);
      // 如果有ref，赋值会原来的值
      if (cloned.ref) cloned.ref = firstChild.ref;
      if (children.length === 1) return cloned;
      children[index] = cloned;
      return children;
    };
  },
});
