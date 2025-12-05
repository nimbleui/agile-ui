import { CanvasAction, ElementType } from "../types";

interface OptionsType<K extends keyof CanvasAction> {
  type: K;
  elements: ElementType[];
  payload: CanvasAction[K];
  selected: Record<string, ElementType>;
}

export function dispatch<K extends keyof CanvasAction>(options: OptionsType<K>, callback: () => void) {
  const { type } = options;

  switch (type) {
    case "APPEND_SITE":
      appendSite(options, callback);
      break;

    default:
      break;
  }
}

function appendSite(options: OptionsType<"APPEND_SITE">, callback: () => void) {
  const { selected, elements, payload } = options;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const value = selected[element.id];
    if (!value) continue;
    element.left = parseInt(`${value.left}`) + payload.disX;
    element.top = parseInt(`${value.top}`) + payload.disY;
  }

  callback();
}
