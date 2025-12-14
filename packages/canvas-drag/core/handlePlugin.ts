import type { Plugin, PluginContext } from "../types";
import maths from "./math";

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

/**
 * 执行插件
 * @param plugins
 */
export function pluginExecute(plugins: Plugin[], type: keyof Omit<Plugin, "name" | "enforce">, options: PluginContext) {
  const pluginList = handlePlugin(plugins);
  for (let i = 0; i < pluginList.length; i++) {
    const item = pluginList[i];

    for (let j = 0; j < item.length; j++) {
      const plugin = item[j];
      const checked = plugin.before?.(options);
      if (checked === false) continue;
      plugin[type]?.(options, maths);
    }
  }
}
