export function isTouchEvent(e: any): e is TouchEvent {
  return Object.prototype.toString.call(e) == "[object TouchEvent]";
}

export function getMouseSite(e: MouseEvent | TouchEvent, zoom = 1) {
  if (isTouchEvent(e)) {
    const touche = e.touches[0];
    return { clientX: touche.clientX / zoom, clientY: touche.clientY / zoom };
  }

  return { clientX: e.clientX / zoom, clientY: e.clientY / zoom };
}

export function getRect(el: Element | null) {
  const rect = el?.getBoundingClientRect();
  return {
    top: rect?.top || 0,
    left: rect?.left || 0,
    width: rect?.width || 0,
    height: rect?.height || 0,
    el: el as HTMLElement,
  };
}

export function getAttrValue(target: HTMLElement, name: string) {
  return target.closest(`[data-${name}]`)?.getAttribute(`data-${name}`);
}
