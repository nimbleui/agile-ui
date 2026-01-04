<script setup lang="ts">
import { computed } from "vue";
import { forEach, isEvent, isString } from "@agile-ui/share";
import { components } from "@agile-ui/components";
import type { ConfigTypes, RenderItemProps } from "./types";
import Render from "./Render.vue";
import { execute, executeCode } from "./execute";
import { executeEventActive } from "./executeActive";

defineOptions({ name: "RenderItem", components });
const props = defineProps<RenderItemProps>();

const children = computed(() => {
  const { item } = props;
  const res: { [key: string]: ConfigTypes[] } = {};
  item.children?.reduce((acc, cur) => {
    const name = cur.slotName || "default";
    if (acc[name]) {
      acc[name].push(cur);
    } else {
      acc[name] = [cur];
    }
    return acc;
  }, res);

  if (item.slots) {
    forEach(item.slots, (value, key) => {
      const slot = props.slots?.[value];
      if (!slot) return;
      const val = { id: `slot-${value}-${key}-${item.id}`, slot };
      if (res[key]) {
        res[key].push(val);
      } else {
        res[key] = [val];
      }
    });
  }

  return res;
});

const show = computed(() => {
  return executeCode(props.item.show, props.data) ?? true;
});

const handleEvent = (value: string) => {
  return (options: Record<string, any> = {}) => {
    const { events } = props;
    if (isEvent(options)) options = { event: options };
    executeEventActive(events?.[value], { ...props.data, ...options });
  };
};

const handleProps = computed(() => {
  const { item, data } = props;
  const on: Record<string, (...args: any[]) => any> = {};
  const newProps = { ...item.props } as Record<string, any>;

  forEach(item.on, (eventName, key) => {
    on[key] = handleEvent(eventName);
  });
  forEach(item.model, (value, key) => {
    newProps[key] = execute(value, data);
    newProps[`onUpdate:${key}`] = (val: any) => {
      const str = isString(val) ? `"${val}"` : val;
      execute(`${value} = ${str}`, data);
    };
  });

  return { on, props: newProps };
});
</script>

<template>
  <component
    v-bind="handleProps.props"
    :is="item.component || item.slot"
    v-if="show"
    :id="item.id"
    v-on="handleProps.on"
  >
    <template v-for="(el, key) in children" :key="key" #[key]>
      <Render :config="el" :slots="slots" :data="data" :template="template" :events="events" />
    </template>
  </component>
</template>
