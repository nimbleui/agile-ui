import type { ElementType, EventTypes, Plugin, PluginContext, PluginFunKey, PluginType } from "../types";
import maths from "./math";
import { handleDispatch } from "./handleDispatch";

/**
 * 分类插件
 * @param plugins 插件列表
 * @returns
 */
export function handlePlugin(plugins: Plugin[]) {
  const pre: Plugin[] = [];
  const normal: Plugin[] = [];
  const post: Plugin[] = [];
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    const { enforce = "normal" } = plugin;
    if (enforce == "pre") pre.push(plugin);
    if (enforce == "normal") normal.push(plugin);
    if (enforce == "post") post.push(plugin);
  }
  return [pre, normal, post];
}

function forEachElement(options: PluginType) {
  const { elements, selected } = options;
  return (
    callback: (data: { selected: boolean; el: ElementType; moveEl: ElementType }) => void,
    type?: "all" | "selected" | "notSelected",
  ) => {
    for (let i = 0; i < elements.length; i++) {
      const moveEl = { ...elements[i] };
      // 按下时的元素信息
      const el = selected[moveEl.id];
      if (type == "selected" && el) {
        callback({ selected: true, el: { ...el }, moveEl });
      }

      if (type == "notSelected" && !el) {
        callback({ selected: false, el, moveEl });
      }

      if (type == "all" || !type) {
        callback({ selected: !!el, el: { ...el }, moveEl });
      }
    }
  };
}

/**
 * 执行插件
 * @param plugins
 */
export function pluginExecute<T extends PluginFunKey>(
  plugins: Plugin[],
  type: T,
  options: PluginType,
  emit: <K extends keyof EventTypes>(type: K, ...args: Parameters<EventTypes[K]>) => void,
) {
  const pluginList = handlePlugin(plugins);
  const forEach = forEachElement(options);
  const { elements, selectIds, keyCode, ...other } = options;
  const pluginContext: PluginContext = {
    forEach,
    ...other,
    keyCode,
    selectIds: [...selectIds],
    dispatch(type, payload, callback) {
      handleDispatch({ type, payload, data: options, elements, emit });
      callback?.();
    },
  };

  for (let i = 0; i < pluginList.length; i++) {
    const item = pluginList[i];
    for (let j = 0; j < item.length; j++) {
      const plugin = item[j];
      const checked = plugin.before?.(pluginContext);
      if (checked === false) continue;
      const { keyCode: code } = plugin;
      const check = code ? (keyCode && code.includes(keyCode)) || (!keyCode && code.includes("-1")) : true;
      if (!check || (keyCode && !code)) continue;

      plugin[type]?.(pluginContext, maths);
      plugin.cursor?.(type, options.containerRect.el);
    }
  }
}
