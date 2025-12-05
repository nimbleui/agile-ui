import { CanvasDragOptions, ElementType, MouseInfo, PluginContext, RectInfo } from "../types";
import { getMouseSite, getRect } from "./utils";
import { handlePlugin } from "./handlePlugin";
import { dispatch } from "./dispatch";

export function canvasDrag(el: (() => Element | undefined) | Element | undefined, options: CanvasDragOptions) {
  const state = {
    el: null as HTMLElement | null,
    elements: [] as ElementType[],
  };

  const pluginContext: PluginContext = {
    isMove: false,
    handle: "",
    selected: {},
    rect: {} as RectInfo,
    containerRect: {} as RectInfo,
    mouse: {} as MouseInfo,
    dispatch(type, payload) {
      dispatch({ type, payload, selected: pluginContext.selected, elements: state.elements }, () => {
        console.log(111);
      });
    },
  };

  function findEl(id: string) {
    return state.elements.find((el) => id == el.id);
  }

  function mousedown(e: MouseEvent | TouchEvent) {
    pluginContext.isMove = true;
    const target = e.target as HTMLElement;
    const handle = target.dataset.dragHandle;
    const id = target.closest("[data-element-id]")?.getAttribute("data-element-id");
    if (handle) pluginContext.handle = handle;

    if (handle == "canvas") {
      pluginContext.selected = {};
    }

    // 判断当前有没有选择
    if (id) {
      const el = findEl(id);
      if (options.keyCode && e[options.keyCode]) {
        if (!pluginContext.selected[id] && el) {
          pluginContext.selected[id] = { ...el };
        }
      } else {
        if (el) pluginContext.selected = { [id]: { ...el } };
      }
    }

    // 获取容器的信息
    const react = getRect(state.el);
    pluginContext.containerRect = react;

    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e);
    pluginContext.mouse.startX = clientX;
    pluginContext.mouse.startY = clientY;

    handlePlugin(options.plugins, "down", pluginContext);
  }

  function mousemove(e: MouseEvent | TouchEvent) {
    if (!pluginContext.isMove) return;
    // 鼠标位置
    const { clientX, clientY } = getMouseSite(e);
    pluginContext.mouse.moveX = clientX;
    pluginContext.mouse.moveY = clientY;

    pluginContext.mouse.disX = clientX - pluginContext.mouse.startX;
    pluginContext.mouse.disY = clientY - pluginContext.mouse.startY;

    handlePlugin(options.plugins, "move", pluginContext);
  }

  const observe = new MutationObserver(() => {
    const value = (typeof el == "function" ? el() : el) as HTMLElement | null;
    if (value) {
      value.addEventListener("mousedown", mousedown);
      value.addEventListener("touchstart", mousedown);

      value.addEventListener("mousemove", mousemove);
      value.addEventListener("touchmove", mousemove);

      state.el = value;
      observe.disconnect();
    }
  });
  observe.observe(document, { childList: true, subtree: true });

  /** 添加元素 */
  function addElement(el: ElementType | ElementType[]) {
    if (Array.isArray(el)) {
      for (let i = 0; i < el.length; i++) {
        state.elements.push(el[i]);
      }
      return;
    }
    state.elements.push(el);
  }

  return { addElement };
}
