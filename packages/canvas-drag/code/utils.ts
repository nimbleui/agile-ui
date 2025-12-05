export function isTouchEvent(e: any): e is TouchEvent {
  return Object.prototype.toString.call(e) == "[object TouchEvent]";
}

export function getMouseSite(e: MouseEvent | TouchEvent) {
  if (isTouchEvent(e)) {
    const touche = e.touches[0];
    return { clientX: touche.clientX, clientY: touche.clientY };
  }

  return { clientX: e.clientX, clientY: e.clientY };
}

export function getRect(el: Element | null) {
  const rect = el?.getBoundingClientRect();
  return {
    top: rect?.top || 0,
    left: rect?.left || 0,
    width: rect?.width || 0,
    height: rect?.height || 0,
  };
}
