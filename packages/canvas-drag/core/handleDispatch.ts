import { CanvasAction, ElementType, EventTypes, PluginContext, RectInfo } from "../types";
import { getSelectionBounds } from "./math";

interface OptionsType<K extends keyof CanvasAction> {
  type: K;
  data: PluginContext;
  payload: CanvasAction[K];
  elements: ElementType[];
  emit: <K extends keyof EventTypes>(type: K, ...args: Parameters<EventTypes[K]>) => void;
}

/** 更新元素信息 */
function UPDATE_ELEMENT(options: OptionsType<"UPDATE_ELEMENT">) {
  const { elements, payload, data, emit } = options;

  const selected: Record<string, RectInfo> = {};
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const value = payload[el.id];
    if (!value) continue;
    Object.assign(el, value);
    selected[el.id] = el;
  }

  emit(
    "change",
    elements.map((el) => ({ ...el })),
  );
  emit("selectBounds", getSelectionBounds(data.selectIds, selected));
}

/** 选择元素ID */
function SELECT_ELEMENT_IDS(options: OptionsType<"SELECT_ELEMENT_IDS">) {
  const { data, payload, emit } = options;

  data.selectIds = payload;
  data.selected = {};
  for (let i = 0; i < payload.length; i++) {
    const id = payload[i];
    const el = data.elements.find((el) => el.id == id);
    if (el) data.selected[id] = { ...el };
  }
  emit("selectBounds", getSelectionBounds(payload, data.selected));
}

/** 更新选择元素的大小 */
function SELECT_BOX(options: OptionsType<"SELECT_BOX">) {
  const { payload, emit } = options;
  emit("selectBox", payload);
}

/** 更新辅助线 */
function UPDATE_GUIDES(options: OptionsType<"UPDATE_GUIDES">) {
  console.log(options);
}

export function handleDispatch<K extends keyof CanvasAction>(options: OptionsType<K>) {
  const { type } = options;
  const funcs = { UPDATE_ELEMENT, SELECT_ELEMENT_IDS, SELECT_BOX, UPDATE_GUIDES };
  funcs[type](options as any);
}
