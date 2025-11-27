import { CanvasDragOptions, StateData } from "../types";

export function canvasDrag(el: (() => Element | undefined) | Element | undefined, options: CanvasDragOptions) {
  const state: StateData = {
    type: "",
    isMove: false,
    el: null as null | HTMLElement,
    selectedIds: [],
  };
  console.log(options);

  function mousedown(e: Event) {
    state.isMove = true;
    const target = e.target as HTMLElement;
    const handle = target.dataset.dragHandle;
    const isGroupDrag = target.dataset.dragGroup;
    const elementId = target.closest("[data-element-id]")?.getAttribute("data-element-id");
    console.log(elementId);
  }

  const observe = new MutationObserver(() => {
    const value = typeof el == "function" ? el() : el;
    if (value) {
      value.addEventListener("mousedown", mousedown);
      value.addEventListener("touchstart", mousedown);
      observe.disconnect();
      state.el = value as HTMLElement;
    }
  });
  observe.observe(document, { childList: true, subtree: true });
}
