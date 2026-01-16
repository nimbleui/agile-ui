import { ActiveTool, CanvasDragOptions, ElementType, EventTypes, MouseInfo, PluginType, RectInfo } from "../types";
import { getAttrValue, getMouseSite, getRect } from "./utils";
import { pluginExecute } from "./handlePlugin";
import { createBindEvent } from "./events";
import { keyboard } from "./keyboard";

export function canvasDrag<T extends ElementType>(
  el: (() => Element | undefined) | Element | undefined,
  options: CanvasDragOptions,
) {
  const state = {
    el: null as HTMLElement | null,
    elements: [] as T[],
  };

  const context: PluginType<T> = {
    isMove: false,
    activeTool: null,
    hoveredId: null,
    elements: [],
    selected: {},
    selectIds: [],
    rect: {} as RectInfo,
    containerRect: {} as RectInfo,
    mouse: {} as MouseInfo,
    selectBound: null,
    zoom: options.zoom || 1,
    translateX: 0,
    translateY: 0,
    keyCode: "",
  };

  const { on, emit, off } = createBindEvent<EventTypes<T>>();
  const removeKey = keyboard((key, type) => {
    if (options.disabled || (context.keyCode == key && type == "down")) return;
    if (type == "down") context.keyCode = key;
    pluginExecute(options.plugins, type == "down" ? "keyDown" : "keyUp", context, emit, state.el!);
    if (type == "up") context.keyCode = "";
  });

  function mousedown(e: MouseEvent | TouchEvent) {
    if (options.disabled) return;
    e.preventDefault();
    context.isMove = true;
    const target = e.target as HTMLElement;
    const id = getAttrValue(target, "element-id");
    const handle = getAttrValue(target, "drag-handle");
    const handleType = getAttrValue(target, "drag-type");
    if (handle) context.activeTool = handle as ActiveTool;
    if (id && !handle) context.activeTool = "drag";
    context.activeToolType = handleType;
    context.elements = state.elements;
    // 获取容器的信息
    const react = getRect(state.el);
    context.containerRect = react;

    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, context.zoom);
    context.mouse.startX = clientX;
    context.mouse.startY = clientY;
    context.hoveredId = id || null;

    emit("down", e);
    pluginExecute(options.plugins, "down", context, emit, state.el!);

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("touchmove", mousemove);

    document.addEventListener("mouseup", mouseup);
    document.addEventListener("touchend", mouseup);
  }

  function mousemove(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (!context.isMove) return;
    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, context.zoom);
    context.mouse.moveX = clientX;
    context.mouse.moveY = clientY;

    context.mouse.disX = clientX - context.mouse.startX;
    context.mouse.disY = clientY - context.mouse.startY;
    emit("move", e);
    pluginExecute(options.plugins, "move", context, emit, state.el!);
  }

  function mouseup(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    context.isMove = false;
    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e, context.zoom);

    context.mouse.endX = clientX - context.mouse.startX;
    context.mouse.endY = clientY - context.mouse.startY;
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("touchmove", mousemove);

    document.removeEventListener("mouseup", mouseup);
    document.removeEventListener("touchend", mouseup);
    emit("up", e);
    pluginExecute(options.plugins, "up", context, emit, state.el!);
  }

  const handleWheel = (e: WheelEvent) => {
    context.mouse.deltaY = e.deltaY;
    context.mouse.deltaX = e.deltaX;
    context.mouse.moveX = e.clientX;
    context.mouse.moveY = e.clientY;
    context.mouse.startX = e.clientX;
    context.mouse.startY = e.clientY;
    e.preventDefault();
    // 获取容器的信息
    context.containerRect = getRect(state.el);
    pluginExecute(options.plugins, "wheel", context, emit, state.el!);
  };

  const observe = new MutationObserver(() => {
    const value = (typeof el == "function" ? el() : el) as HTMLElement | null;
    if (value) {
      value.addEventListener("mousedown", mousedown);
      value.addEventListener("touchstart", mousedown);
      value.addEventListener("wheel", handleWheel);

      state.el = value;
      observe.disconnect();
    }
  });
  observe.observe(document, { childList: true, subtree: true });

  /** 添加元素 */
  function addElement(el: T | T[]) {
    if (Array.isArray(el)) {
      for (let i = 0; i < el.length; i++) {
        state.elements.push(el[i]);
      }
      return;
    }
    state.elements.push(el);
  }
  /** 设置元素 */
  function setElement(els: T[]) {
    state.elements = els;
  }

  function setZoom(zoom: number) {
    context.zoom = zoom;
  }

  /** 销毁 */
  function destroy() {
    removeKey();
    state.el?.removeEventListener("mousedown", mousedown);
    state.el?.removeEventListener("touchstart", mousedown);
    state.el?.removeEventListener("wheel", handleWheel);
  }

  return { addElement, on, off, setZoom, setElement, destroy };
}
