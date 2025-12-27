import { CanvasDragOptions, ElementType, EventTypes, MouseInfo, PluginType, RectInfo } from "../types";
import { getMouseSite, getRect } from "./utils";
import { pluginExecute } from "./handlePlugin";
import { createBindEvent } from "./events";

export function canvasDrag(el: (() => Element | undefined) | Element | undefined, options: CanvasDragOptions) {
  const state = {
    el: null as HTMLElement | null,
    elements: [] as ElementType[],
  };

  const { on, emit, off } = createBindEvent<EventTypes>();

  const pluginContext: PluginType = {
    isMove: false,
    activeTool: "",
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
    pluginContext.isMove = true;
    const target = e.target as HTMLElement;
    const handle = target.dataset.dragHandle;
    const handleType = target.dataset.dragType;
    const id = target.closest("[data-element-id]")?.getAttribute("data-element-id");
    if (handle) pluginContext.activeTool = handle;
    if (id && !handle) pluginContext.activeTool = "drag";
    pluginContext.activeToolType = handleType;
    pluginContext.elements = state.elements;
    // 获取容器的信息
    const react = getRect(state.el);
    pluginContext.containerRect = react;

    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, options.zoom);
    pluginContext.mouse.startX = clientX;
    pluginContext.mouse.startY = clientY;
    pluginContext.hoveredId = id || null;
    pluginContext.multiSelect = !!(options.keyCode && e[options.keyCode]);

    pluginExecute(options.plugins, "down", pluginContext, emit);

    for (let i = 0; i < pluginContext.selectIds.length; i++) {
      const id = pluginContext.selectIds[i];
      const el = state.elements.find((el) => el.id == id);
      if (el) pluginContext.selected[id] = { ...el };
    }
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("touchmove", mousemove);

    document.addEventListener("mouseup", mouseup);
    document.addEventListener("touchend", mouseup);
  }

  function mousemove(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (!pluginContext.isMove) return;
    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, options.zoom);
    pluginContext.mouse.moveX = clientX;
    pluginContext.mouse.moveY = clientY;

    pluginContext.mouse.disX = clientX - pluginContext.mouse.startX;
    pluginContext.mouse.disY = clientY - pluginContext.mouse.startY;

    pluginExecute(options.plugins, "move", pluginContext, emit);
  }

  function mouseup(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    pluginContext.isMove = false;
    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, options.zoom);

    pluginContext.mouse.endX = clientX - pluginContext.mouse.startX;
    pluginContext.mouse.endY = clientY - pluginContext.mouse.startY;
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("touchmove", mousemove);

    document.removeEventListener("mouseup", mouseup);
    document.removeEventListener("touchend", mouseup);

    pluginExecute(options.plugins, "up", pluginContext, emit);
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
