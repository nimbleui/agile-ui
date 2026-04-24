<script setup lang="ts">
import { computed } from "vue";
import type { RenderItemProps, ConfigList } from "./types";
import Renders from "./Renders.vue";
import { forEach } from "@agile-ui/share";
import { getSignAndValue } from "./utils";

defineOptions({ name: "RenderItem" });

const props = defineProps<RenderItemProps>();

// 处理子元素
const children = computed(() => {
  const { config } = props;
  const res: { [key: string]: ConfigList } = {};

  forEach(config.children!, (item) => {
    const name = item.slotName || "default";
    if (!res[name]) res[name] = [];
    res[name].push(item);
  });

  forEach(config.slot, (value, key) => {
    const slot = props.slots?.[value];
    if (!slot) return;
    const val = { uuid: `slot-${value}-${key}-${config.uuid}`, slot };
    if (!res[key]) res[key] = [];
    res[key] = [val];
  });

  return res;
});

// 控制显示隐藏
const show = computed(() => {
  const res = { if: true, show: true };
  const value = getSignAndValue(props.config.show);
  if (!value) return res;
  // res[value.sign]
  return res;
});
</script>

<template>
  <template v-if="show.if">
    <component :is="config.component || config.slot" v-show="show.show">
      <template v-for="(item, key) in children" :key="key">
        <Renders :config="item" :slots="slots" :data="data" :template="template" :events="events" />
      </template>
    </component>
  </template>
</template>
