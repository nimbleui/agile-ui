import { reactive, type Ref } from "vue";
import type { ScrollbarThumbProps } from "./types";

const fields = {
  x: {
    offset: "offsetWidth",
    scrollSize: "scrollWidth",
    scroll: "scrollLeft",
    size: "width",
    client: "clientX",
    start: "startX",
  },
  y: {
    offset: "offsetHeight",
    scrollSize: "scrollHeight",
    scroll: "scrollTop",
    size: "height",
    client: "clientY",
    start: "startY",
  },
} as const;

export function useMouse(wrap: Ref<HTMLElement | null>, props: ScrollbarThumbProps) {
  const data = reactive({
    startX: 0,
    startY: 0,
    isMove: false,
    scroll: 0,
  });

  let el: HTMLElement;
  const field = fields[props.isVertical ? "y" : "x"];

  const onDown = (e: MouseEvent) => {
    e.preventDefault();
    const { clientX, clientY, target } = e;
    el = (target as HTMLElement).closest(`[data-thumb]`) as HTMLElement;
    data.startX = clientX;
    data.startY = clientY;
    data.scroll = wrap.value?.[field.scroll] || 0;
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const onMove = (e: MouseEvent) => {
    data.isMove = true;
    const dis = e[field.client] - data[field.start];

    if (!el || !wrap.value) return;

    const offset = wrap.value[field.offset];
    const scrollSize = wrap.value[field.scrollSize];
    const size = el.getBoundingClientRect()[field.size];

    const thumbMovableRange = offset - size;
    const scrollRange = scrollSize - offset;
    const scroll = (dis * scrollRange) / thumbMovableRange;

    wrap.value.scrollTop = scroll + data.scroll;
  };

  const onUp = () => {
    data.isMove = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  return { data, onDown };
}
