<script setup lang="ts">
import { reactive } from "vue";
import { ConfigTypes, NodeTypes, RenderItem, RenderNode } from "@agile-ui/ui";
import {
  CanvasDrag,
  collisionPlugin,
  dragPlugin,
  rotatePlugin,
  scalePlugin,
  selectPlugin,
  smartGuidesPlugin,
  scaleCanvasPlugin,
  dragCanvasPlugin,
  type ElementType,
  type Plugin,
} from "@agile-ui/canvas-drag";
import { createExpressionEngine, CustomFunctionDef, CustomFunctionManager, Sandbox } from "@agile-ui/expr-engine";
import registry from "./components";

defineOptions({ name: "App" });
// const a = ref("222");
// setTimeout(() => {
//   a.value = "3333";
// }, 2000);
// const show = ref(false);
const elements = reactive<(ElementType & ConfigTypes)[]>([
  {
    component: "YInput",
    id: "1",
    width: 100,
    height: 100,
    left: 50,
    top: 50,
    angle: 45,
    disabled: true,
    style: { backgroundColor: "#ff5555" },
  },
  { component: "YInput", id: "2", width: 100, height: 100, left: 200, top: 200, style: { backgroundColor: "#5555ff" } },
  { component: "YInput", id: "3", width: 100, height: 100, left: 350, top: 350, style: { backgroundColor: "#55ff55" } },
  // { id: "4", width: 100, height: 100, left: 500, top: 500, style: { backgroundColor: "#55ff55" } },
]);

setTimeout(() => {
  elements.push({
    component: "YInput",
    id: "4",
    width: 100,
    height: 100,
    left: 500,
    top: 500,
    style: { backgroundColor: "#ffaa00" },
  });
}, 5000);

const data = reactive({});
const plugins: Plugin[] = [
  rotatePlugin(),
  selectPlugin(),
  scalePlugin(),
  dragPlugin(true),
  smartGuidesPlugin(),
  collisionPlugin(),
  scaleCanvasPlugin(),
  dragCanvasPlugin(),
];

// const lexer = new Lexer();
// console.log(lexer.tokenize("11 + 12 > 16 && aa"));
// console.log(lexer.tokenize("(11 + 12) * 16 > 88 && cc"));
// console.log(lexer.tokenize(`arr[1] && obj.aa && obj.cc > 16`));
// console.log(lexer.tokenize("sun(11, 22) or"));
// console.log(
//   lexer.tokenize(`
// "dfadasdafaddfasdfasdf"
// `),
// );
// const parser = new Parser();
// console.log(parser.parse("11 + 12 > 16 && aa"));
// console.log(parser.parse("sun(11, 22, 33)"));
// console.log(parser.parse("(11 + 12) * 16 + 12"));
// console.log(parser.parse("!(value && data.a)"));
const run = async () => {
  const engine = createExpressionEngine({
    timeout: 5000,
  });
  // const ctx = engine.createContext({
  //   a: 11,
  //   b: 10,
  //   users: [
  //     { name: "Alice", status: "active", num: 3 },
  //     { name: "Bob", status: "inactive", num: 13 },
  //     { name: "Charlie", status: "active", num: 10 },
  //   ],
  // });
  // engine.registry.register({
  //   name: "add",
  //   signature: { paramTypes: [Types.number, Types.number], returnType: Types.number },
  //   execute: (args) => {
  //     const a = args[0] as number;
  //     const b = args[1] as number;
  //     return a + b;
  //   },
  // });
  // engine.registry.register({
  //   name: "isActive",
  //   signature: { paramTypes: [Types.any], returnType: Types.boolean },
  //   execute: (args) => {
  //     const user = args[0] as { name: string; status: string };
  //     return user.status === "active";
  //   },
  // });
  // console.log(await engine.compiler.execute("2222", ctx));
  // console.log(await engine.compiler.execute("add(a, b) * 3", ctx));
  // console.log(await engine.compiler.execute("(1 + 3) * 3", ctx));
  // console.log(await engine.compiler.execute("users[0].num", ctx));
  // console.log(await engine.compiler.execute("arrFilter(users, 'isActive')", ctx));
  // console.log(await engine.compiler.execute("arrFilter(users, (item, i) => item.num > b)", ctx));

  const pageRegistry = engine.createPageRegistry();
  const sandbox = new Sandbox(pageRegistry, { timeout: 5000 });
  const funcManager = new CustomFunctionManager(pageRegistry, sandbox);

  // 定义两个自定义函数
  const customFuncs: CustomFunctionDef[] = [
    {
      id: "fn1",
      name: "fullName",
      description: "拼接名字",
      params: [{ name: "user" }],
      body: `user.firstName + ' ' + user.lastName`,
      returnType: "string",
    },
    {
      id: "fn2",
      name: "adult",
      description: "查找成年",
      params: [{ name: "person" }],
      body: `person.age >= age`,
      returnType: "boolean",
    },
  ];
  funcManager.registerAll(customFuncs);

  const pageContext = engine.createContext(
    {
      age: 18,
      name: "chen",
      users: [
        { firstName: "Alice", lastName: "Wang", age: 25 },
        { firstName: "Bob", lastName: "Li", age: 17 },
      ],
      keys: { key: "age" },
      userInfo: { name: "yu", age: 22 },
    },
    pageRegistry,
  );

  console.log(await engine.compiler.execute(`srtConcat(toString(age), name)`, pageContext));
  console.log(await engine.compiler.execute(`11 * (1 + 3) - age / 3`, pageContext));
  // 使用 Lambda + 自定义函数
  const names = await engine.compiler.execute(`arrMap(users, (u) => fullName(u))`, pageContext);
  console.log(names); // [ 'Alice Wang', 'Bob Li' ]

  const adults = await engine.compiler.execute(`arrFilter(users, (u) => adult(u))`, pageContext);
  console.log(adults); // [ { firstName: 'Alice', ... age: 25 } ]

  const age = await engine.compiler.execute("userInfo[keys.key]", pageContext);
  console.log("age", age);
};
run();

/**
 * 事件链
 * 1.事件模型（统一事件结构，支持事件上下文，事件传播机制（冒泡 or 精准触发），事件命名空间）
 * 2.事件链编排（顺序执行，条件分支，并行执行，循环 / 重试，子流程 / 复用）
 * 3.执行引擎（执行模式，状态管理，错误处理）
 * 4.数据流系统（节点输入/输出映射，表达式系统，数据作用域）
 * 5.节点系统
 * 6.调试与可观测性（可视化调试，日志系统，执行回放，性能监控）
 * 7.权限与安全
 */

const nodeData = reactive({ name: "陈", age: 23, sex: "男" });

const node = reactive<NodeTypes>({
  id: "root",
  component: "YDetail",
  props: {
    items: [
      { label: "名字：", key: "name" },
      { label: "年龄：", key: "age" },
      { label: "性别：", key: "sex" },
    ],
    data: nodeData,
  },
  slots: {
    "value-name": [
      {
        id: "55555",
        component: "YText",
        props: { text: "{{props.data[item.key]}}" },
      },
    ],
  },
});
const context = reactive({});

const nodes = reactive<NodeTypes>({
  id: "1233",
  component: "YDialog",
  events: {},
  props: { title: "2222" },
  children: [{ id: "666", component: "YText", props: { text: "3333" } }],
});
</script>

<template>
  <CanvasDrag v-model:elements="elements" :plugins="plugins">
    <template #item="{ item }">
      <RenderItem :data="data" :item="item" />
    </template>
  </CanvasDrag>

  <RenderNode :node="node" :context="context" :custom-components="registry" />
  <RenderNode :node="nodes" :context="context" :custom-components="registry" />
</template>
