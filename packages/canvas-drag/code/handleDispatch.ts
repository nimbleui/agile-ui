import { CanvasAction, EventTypes, PluginContext } from "../types";
import { getSelectionBounds } from "./math";

interface OptionsType<K extends keyof CanvasAction> {
  type: K;
  data: PluginContext;
  payload: CanvasAction[K];
  emit: <K extends keyof EventTypes>(type: K, ...args: Parameters<EventTypes[K]>) => void;
}

/** 更新元素信息 */
function UPDATE_ELEMENT(options: OptionsType<"UPDATE_ELEMENT">) {
  const { data, payload, emit } = options;

  for (let i = 0; i < data.elements.length; i++) {
    const element = data.elements[i];
    const value = payload[element.id];
    if (!value) continue;
    Object.assign(element, value);
  }

  emit("change", data.elements);
}

/** 选择元素ID */
function SELECT_ELEMENT_IDS(options: OptionsType<"SELECT_ELEMENT_IDS">) {
  const { data, payload, emit } = options;

  data.selectIds = payload;
  data.selected = {};
  for (let i = 0; i < payload.length; i++) {
    const id = payload[i];
    const el = data.elements.find((el) => el.id == id);
    if (el) {
      data.selected[id] = { ...el };
    }
  }
  emit("selectBounds", getSelectionBounds(payload, data.selected));
}

/** 更新选择元素的大小 */
function SELECT_BOX(options: OptionsType<"SELECT_BOX">) {
  const { payload, emit } = options;
  emit("selectBox", payload);
}

export function handleDispatch<K extends keyof CanvasAction>(options: OptionsType<K>) {
  const { type } = options;
  const funcs = { UPDATE_ELEMENT, SELECT_ELEMENT_IDS, SELECT_BOX };
  funcs[type](options as any);
}
