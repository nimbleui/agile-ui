<script setup lang="ts">
import { computed } from "vue";
import { forEach, isEvent } from "@agile-ui/share";
import { components } from "@agile-ui/components";
import type { ConfigTypes, RenderItemProps } from "./types";
import Render from "./Render.vue";
import { executeCode } from "./execute";
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
      const val = { uuid: `slot-${value}-${key}-${item.uuid}`, slot };
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

const onEvents = computed(() => {
  const { item } = props;
  const res: Record<string, (...args: any[]) => any> = {};
  if (!item.on) return res;
  forEach(item.on, (eventName, key) => {
    res[key] = handleEvent(eventName);
  });
  return res;
});
</script>

<template>
  <component :is="item.component || item.slot" v-if="show" v-bind="item.props" :uuid="item.uuid" v-on="onEvents">
    <template v-for="(el, key) in children" :key="key" #[key]>
      <Render :config="el" :slots="slots" :data="data" :template="template" :events="events" />
    </template>
  </component>
</template>
