<script setup lang="ts">
import { computed, Fragment, h, VNode } from "vue";
import { ComponentRegistryItem, NodeTypes } from "./types";
import { handleExpression } from "./expression";
import { components, atomicComponent } from "@agile-ui/components";

defineOptions({ name: "RenderNode" });

const props = defineProps<{
  /** 当前需要渲染的节点 */
  node: NodeTypes;
  /** 全局上下文，例如 { state: { ... } } */
  context: Record<string, any>;
  /** 可选，由父组件传递的作用域（用于复合组件内部隔离） */
  scope?: Record<string, any>;
  customComponents?: ComponentRegistryItem[];
}>();

const registry = computed<ComponentRegistryItem[]>(() => {
  return [...atomicComponent, ...(props.customComponents || [])];
});

/**
 * 当前节点的完整作用域对象，合并了父级传递的 scope、全局 context。
 * 后续所有的表达式求值、事件处理都将基于这个 scope。
 * 它包含：
 *   props    - 当前组件接收的属性值（已经过解析的）
 *   events   - 父级绑定的事件处理器
 *   slots    - 具名插槽内容
 *   children - 默认插槽内容
 *   context  - 全局上下文
 */
const currentScope = computed(() => {
  // 将 context 的所有属性提升为顶层变量
  const expandedContext = { ...props.context };
  return {
    ...expandedContext, // state, api 等成为顶层变量
    props: {},
    events: {} as Record<string, any>,
    slots: {} as Record<string, NodeTypes[]>,
    children: [] as NodeTypes[],
    context: props.context, // 仍保留完整 context 对象
    ...props.scope,
  };
});

const createResolve = handleExpression();

const SLOT_KEY = "$slot:";
/**
 * 将单个 JSON 节点渲染为 Vue VNode（可能是单个 VNode 或数组）。
 * 支持：
 * - 条件渲染 (node.condition)
 * - 循环渲染 (node.loop)
 * - $slot 占位符替换
 * - 原子组件和复合组件的渲染
 * - 递归处理子节点
 *
 * @param node          当前要渲染的节点对象
 * @param scopeOverride 可选的作用域覆盖，通常用于循环内部等场景
 * @returns VNode 或 VNode 数组，或 null（条件为false时）
 */
const renderNode = (node: NodeTypes, scopeOverride?: Record<string, any>): VNode | VNode[] | null => {
  // 1. 合并作用域：如果传入了 scopeOverride，则优先使用；否则使用当前组件作用域
  const scope = { ...currentScope.value, ...scopeOverride };

  // 2. 创建上下文环境
  const { evaluate, evaluateObj } = createResolve(scope);

  const { condition, loop, component } = node;

  // 3. 条件渲染
  if (condition && !evaluate(condition)) return null;

  // 4. 循环渲染
  if (loop) {
    // 获取循环数组
    const list = evaluate(loop.source);
    if (!Array.isArray(list)) return null;

    // 获取循环项和索引的变量名，默认为 'item' 和 'index'
    const itemName = loop.itemName || "item";
    const indexName = loop.indexName || "index";

    // 遍历数组，为每一项生成一个克隆节点并渲染
    return list.flatMap((item, index) => {
      const loopScope = { ...scope, [itemName]: item, [indexName]: index };
      // 克隆节点，清除 loop 和 condition 属性，避免重复处理，同时保证 id 唯一
      const clonedNode: NodeTypes = {
        ...node,
        id: `${node.id}_${item[loop.key ?? "id"] ?? index}`,
        loop: undefined,
        condition: undefined,
      };
      // 递归渲染克隆节点，传入循环作用域
      return renderNode(clonedNode, loopScope) ?? [];
    });
  }

  // 5. 插槽占位符处理
  if (component.indexOf(SLOT_KEY) == 0) {
    const name = component.substring(SLOT_KEY.length);
    const slotName = evaluate<string>(name);
    const slotContent = name === "default" ? scope.children : scope.slots[slotName];

    // 如果没有提供插槽内容，则渲染 Slot 节点自身的 children（作为后备内容）
    if (!slotContent?.length) {
      return (node.children || []).flatMap((child) => renderNode(child, scope) ?? []);
    }

    // 渲染提供的插槽内容
    return slotContent.flatMap((child) => renderNode(child, scope) ?? []);
  }

  // 6. 在注册表中查找组件定义
  const compEntry = registry.value.find((c) => c.name === component);
  if (!compEntry) {
    console.error(`组件未注册: ${component}`);
    return null;
  }

  // 7. 原子组件渲染
  if (compEntry.type == "atomic") {
    // 7.1 解析属性中的表达式
    const resolvedProps = evaluateObj(node.props || {});

    // 7.2 处理事件绑定：将 JSON 中的事件描述转为真实的事件处理函数
    // 暂时没实现
    const eventHandlers = {};

    // 7.3 递归渲染默认插槽 children
    const children = (node.children || []).flatMap((child) => renderNode(child, scope) ?? []);

    // 7.4 处理具名插槽（如果原子组件支持）
    const slotObj: Record<string, () => VNode[]> = {};
    if (node.slots) {
      for (const [slotName, slotNodes] of Object.entries(node.slots)) {
        // 每个具名插槽返回一个函数，内部递归渲染其子节点
        slotObj[slotName] = () => slotNodes.flatMap((sn) => renderNode(sn, scope) ?? []);
      }
    }

    // 7.5 使用 h 函数创建 VNode
    // 优先使用原子组件映射表中的组件，如果找不到则使用组件名字符串（用于全局注册的组件）
    return h(
      (components[node.component as keyof typeof components] as any) || node.component,
      { ...resolvedProps, ...eventHandlers }, // 合并静态属性和事件处理器
      {
        default: () => children, // 默认插槽内容
        ...slotObj, // 具名插槽内容
      },
    );
  }

  // 8. 复合组件渲染
  if (compEntry.type == "composite" && compEntry.definition) {
    const def = compEntry.definition;

    // 8.1 解析属性中的表达式
    const instanceProps = evaluateObj(node.props || {});

    // 8.2 合并默认 props：先取定义中的默认值，再用实例传入的值覆盖
    const defaultProps: Record<string, any> = {};
    def.props.forEach((p) => {
      if (p.default !== undefined) defaultProps[p.name] = p.default;
    });
    const finalProps = { ...defaultProps, ...instanceProps };

    // 8.3 定义内部 emit 函数，用于将复合组件内部 emit 的事件传递给父组件
    // 暂时没实现
    const emitEvent = {};

    // 8.4 构建复合组件内部渲染的作用域
    const internalScope = {
      ...scope, // 继承外部作用域
      props: finalProps, // 解析后的 props
      events: node.events || {}, // 复合组件实例上绑定的事件
      slots: node.slots || {}, // 复合组件实例的具名插槽内容
      children: node.children || [], // 复合组件实例的默认插槽内容
      context: scope.context, // 全局上下文不变
      $emit: emitEvent, // 提供 $emit 方便内部模板使用
    };

    // 8.5 递归渲染复合组件的内部模板
    return renderNode(def.template, internalScope);
  }

  // 未知类型，返回 null
  return null;
};

const vNode = computed(() => {
  const res = renderNode(props.node);
  return Array.isArray(res) ? h(Fragment, res) : res;
});
</script>

<template>
  <component :is="vNode" />
</template>
