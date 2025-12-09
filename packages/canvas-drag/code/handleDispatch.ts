import { CanvasAction, ElementType, EventTypes } from "../types";

interface OptionsType<K extends keyof CanvasAction> {
  type: K;
  elements: ElementType[];
  payload: CanvasAction[K];
  emit: <K extends keyof EventTypes>(type: K, ...args: Parameters<EventTypes[K]>) => void;
}

export function handleDispatch<K extends keyof CanvasAction>(options: OptionsType<K>, callback?: (type: K) => void) {
  const { type } = options;

  switch (type) {
    case "UPDATE_ELEMENT":
      appendSite(options as OptionsType<"UPDATE_ELEMENT">, callback as any);
      break;

    default:
      break;
  }
}

function appendSite(options: OptionsType<"UPDATE_ELEMENT">, callback: (type: string) => void) {
  const { elements, payload, emit } = options;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const value = payload[element.id];
    if (!value) continue;
    Object.assign(element, value);
  }

  emit("change", elements);
  callback("UPDATE_ELEMENT");
}
