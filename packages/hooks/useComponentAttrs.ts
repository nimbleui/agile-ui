import { computed, HTMLAttributes } from "vue";

export function useComponentAttrs(
  attrs: Record<string, any>,
  defaultValue?: { style?: HTMLAttributes["style"]; class?: HTMLAttributes["class"] },
) {
  const style = computed(() => {
    return [defaultValue?.style || {}, attrs.style || {}];
  });

  const classNames = computed(() => {
    return [defaultValue?.class || {}, attrs.class || {}];
  });

  return { style, classNames };
}
