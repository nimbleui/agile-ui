<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, reactive, ref } from "vue";
import VirtualList from "../VirtualList";
import type { TreeVirtualNode, TreeVirtualProps } from "./types";
import { findNodeById, flattenTree } from "./utils";

defineOptions({ name: "TreeVirtual" });

const props = withDefaults(defineProps<TreeVirtualProps<T>>(), {
  idKey: "id",
  indent: 20,
  childrenKey: "children",
});

const itemKey = (item: T) => item[props.idKey];

const selectedId = ref<string | number | null>(null);
const checkedIds = reactive(new Set<string | number>());
const indeterminateIds = reactive(new Set<string | number>());

// 计算可视节点
const flatTree = computed(() => flattenTree(props.data, props));

// 展开/折叠
function toggleExpand(node: TreeVirtualNode<T>) {
  if (node.isLeaf) return;

  const child = node[props.childrenKey] as TreeVirtualNode<T>[];
  // 异步懒加载
  if ((!child || child.length === 0) && props.loadChildren) {
    node.loading = true;
    props.loadChildren(node).then((children) => {
      node.expanded = true;
      node.loading = false;
      // 新增子节点必须响应式
      (node as any)[props.childrenKey] = children;
    });
  } else {
    node.expanded = !node.expanded;
  }
}

// 选中节点
function selectNode(node: T) {
  selectedId.value = node[props.idKey];
}

// 多选逻辑
function toggleCheck(node: TreeVirtualNode<T>) {
  const id = node[props.idKey];
  const checked = checkedIds.has(id);
  if (checked) checkedIds.delete(id);
  else checkedIds.add(id);

  // 更新子节点
  updateChildrenCheck(node, !checked);
  // 更新父节点
  updateParentCheck(node.parentId);
}

// 更新子节点
function updateChildrenCheck(node: TreeVirtualNode<T>, checked: boolean) {
  const id = node[props.idKey];
  // 删除当前节点的半选状态
  indeterminateIds.delete(id);

  if (checked) checkedIds.add(id);
  else checkedIds.delete(id);

  const children = node[props.childrenKey] as TreeVirtualNode<T>[];
  if (!children) return;
  for (const child of children) {
    updateChildrenCheck(child, checked);
  }
}

// 判断子树状态
function getSubtreeCheckState(node: T): "checked" | "unchecked" | "indeterminate" {
  const children = node[props.childrenKey] as T[];
  if (!children || children.length === 0) {
    return checkedIds.has(node[props.idKey]) ? "checked" : "unchecked";
  }

  let allChecked = true;
  let allUnchecked = true;

  for (const child of children) {
    const state = getSubtreeCheckState(child);
    if (state !== "checked") allChecked = false;
    if (state !== "unchecked") allUnchecked = false;
  }

  if (allChecked) return "checked";
  if (allUnchecked) return "unchecked";
  return "indeterminate";
}

// 更新父节点状态
function updateParentCheck(parentId?: string | number | null) {
  if (!parentId) return;
  const parent = findNodeById(props.data, parentId, props);
  const id = parent?.[props.idKey];
  if (!id) return;

  const state = getSubtreeCheckState(parent);
  if (state === "checked") {
    checkedIds.add(id);
    indeterminateIds.delete(id);
  } else if (state === "unchecked") {
    checkedIds.delete(id);
    indeterminateIds.delete(id);
  } else {
    checkedIds.delete(id);
    indeterminateIds.add(id);
  }
  // 递归更新上级
  updateParentCheck(parent.parentId);
}
</script>

<template>
  <VirtualList as-child :item-size="itemSize" :items="flatTree" :item-key="itemKey">
    <template #default="{ item }">
      <div :style="{ paddingLeft: `${item.level * indent}px` }">
        <!-- 展开/折叠图标 -->
        <span v-if="!item.isLeaf" class="expand-icon" @click="toggleExpand(item)">
          <slot name="expand" :expanded="item.expanded">
            {{ item.expanded ? "-" : "+" }}
          </slot>
        </span>
        <span v-else style="display: inline-block; width: 14px"></span>

        <!-- 复选框 -->
        <input
          v-if="checkable"
          type="checkbox"
          :checked="checkedIds.has(item.id)"
          :indeterminate="indeterminateIds.has(item.id)"
          @change="toggleCheck(item)"
        />

        <!-- 节点标签 -->
        <slot name="item" :item="item" :selected="item.id === selectedId">
          <span class="node-label" :class="{ selected: item.id === selectedId }" @click="selectNode(item)">
            {{ item.label }}
          </span>
        </slot>

        <!-- 异步加载中 -->
        <span v-if="item.loading" class="loading">⏳</span>
      </div>
    </template>
  </VirtualList>
</template>

<style lang="scss">
.tree-node {
  top: 0;
  position: absolute;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
}

.tree-node:hover {
  background-color: #f5f7fa;
}

.expand-icon {
  width: 14px;
  display: inline-block;
  text-align: center;
  cursor: pointer;
}

.node-label.selected {
  background-color: #e6f7ff;
}

.loading {
  margin-left: 5px;
  font-size: 12px;
  color: #999;
}
</style>
