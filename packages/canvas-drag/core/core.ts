import { ActiveTool, CanvasDragOptions, ElementType, EventTypes, MouseInfo, PluginType, RectInfo } from "../types";
import { getMouseSite, getRect } from "./utils";
import { pluginExecute } from "./handlePlugin";
import { createBindEvent } from "./events";

export function canvasDrag(el: (() => Element | undefined) | Element | undefined, options: CanvasDragOptions) {
  const state = {
    el: null as HTMLElement | null,
    elements: [] as ElementType[],
  };

  const { on, emit, off } = createBindEvent<EventTypes>();

  const context: PluginType = {
    isMove: false,
    activeTool: null,
    hoveredId: null,
    elements: [],
    selected: {},
    selectIds: [],
    multiSelect: false,
    rect: {} as RectInfo,
    containerRect: {} as RectInfo,
    mouse: {} as MouseInfo,
    selectBound: null,
  };

  function mousedown(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    context.isMove = true;
    const target = e.target as HTMLElement;
    const handle = target.dataset.dragHandle;
    const handleType = target.dataset.dragType;
    const id = target.closest("[data-element-id]")?.getAttribute("data-element-id");
    if (handle) context.activeTool = handle as ActiveTool;
    if (id && !handle) context.activeTool = "drag";
    context.activeToolType = handleType;
    context.elements = state.elements;
    // 获取容器的信息
    const react = getRect(state.el);
    context.containerRect = react;

    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, options.zoom);
    context.mouse.startX = clientX;
    context.mouse.startY = clientY;
    context.hoveredId = id || null;
    context.multiSelect = !!(options.keyCode && e[options.keyCode]);

    pluginExecute(options.plugins, "down", context, emit);

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("touchmove", mousemove);

    document.addEventListener("mouseup", mouseup);
    document.addEventListener("touchend", mouseup);
  }

  function mousemove(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (!context.isMove) return;
    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, options.zoom);
    context.mouse.moveX = clientX;
    context.mouse.moveY = clientY;

    context.mouse.disX = clientX - context.mouse.startX;
    context.mouse.disY = clientY - context.mouse.startY;

    pluginExecute(options.plugins, "move", context, emit);
  }

  function mouseup(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    context.isMove = false;
    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, options.zoom);

    context.mouse.endX = clientX - context.mouse.startX;
    context.mouse.endY = clientY - context.mouse.startY;
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("touchmove", mousemove);

    document.removeEventListener("mouseup", mouseup);
    document.removeEventListener("touchend", mouseup);

    pluginExecute(options.plugins, "up", context, emit);
  }

  const observe = new MutationObserver(() => {
    const value = (typeof el == "function" ? el() : el) as HTMLElement | null;
    if (value) {
      value.addEventListener("mousedown", mousedown);
      value.addEventListener("touchstart", mousedown);

      state.el = value;
      observe.disconnect();
    }
  });
  observe.observe(document, { childList: true, subtree: true });

  /** 添加元素 */
  function addElement(el: ElementType | ElementType[]) {
    if (Array.isArray(el)) {
      for (let i = 0; i < el.length; i++) {
        state.elements.push({ ...el[i] });
      }
      return;
    }
    state.elements.push({ ...el });
  }

  return { addElement, on, off };
}
