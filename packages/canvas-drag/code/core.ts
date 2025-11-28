import { CanvasDragOptions, StateData } from "../types";

export function canvasDrag(el: (() => Element | undefined) | Element | undefined, options: CanvasDragOptions) {
  const state: StateData = {
    type: "",
    isMove: false,
    el: null as null | HTMLElement,
    selectedIds: {},
    elements: options.elements?.map((el) => ({ ...el })) ?? [],
  };

  function findEl(id: string | number) {
    return state.elements.find((el) => el.id == id);
  }

  function mousedown(e: Event) {
    state.isMove = true;
    const target = e.target as HTMLElement;
    const handle = target.dataset.dragHandle;
    // const isGroupDrag = target.dataset.dragGroup;
    const elementId = target.closest("[data-element-id]")?.getAttribute("data-element-id");
    if (elementId) state.selectedIds[elementId] = true;
    if (handle) state.type = handle;
    findEl;
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
