<script setup lang="ts">
import { computed } from "vue";
import { forEach } from "@agile-ui/share";
import { components } from "@agile-ui/components";
import type { ConfigTypes, RenderItemProps } from "./types";
import Render from "./Render.vue";
import { execute } from "./execute";

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
  return execute(props.item.show, { data: props.data }) ?? true;
});
</script>

<template>
  <component :is="item.component || item.slot" v-if="show" v-bind="item.props" :uuid="item.uuid">
    <template v-for="(el, key) in children" :key="key" #[key]>
      <Render :config="el" :slots="slots" :data="data" :template="template" />
    </template>
  </component>
</template>
