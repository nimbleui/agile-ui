import type { Plugin, PluginContext } from "../types";

export function handlePlugin(plugins: Plugin[], type: keyof Omit<Plugin, "name">, options: PluginContext) {
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    const checked = plugin.before?.(options);
    if (checked === false) continue;

    plugin[type]?.(options);
  }
}
