import { CanvasAction, ElementType } from "../types";

interface OptionsType<K extends keyof CanvasAction> {
  type: K;
  elements: ElementType[];
  payload: CanvasAction[K];
}

export function handleDispatch<K extends keyof CanvasAction>(options: OptionsType<K>, callback: () => void) {
  const { type } = options;

  switch (type) {
    case "UPDATE_ELEMENT":
      appendSite(options as any, callback);
      break;

    default:
      break;
  }
}

function appendSite(options: OptionsType<"UPDATE_ELEMENT">, callback: () => void) {
  const { elements, payload } = options;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const value = payload[element.id];
    if (!value) continue;
    Object.assign(element, value);
  }

  callback();
}
