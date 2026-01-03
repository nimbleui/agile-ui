import { Plugin, RectInfo } from "../types";

function getZoomCenter(rect: RectInfo, clientX: number, clientY: number): { x: number; y: number } {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  if (clientX >= rect.left && clientX <= right && clientY >= rect.top && clientY <= bottom) {
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x, y };
  }

  return { x: 0.5, y: 0.5 };
}

export function scaleCanvasPlugin(option?: { minScale?: number; maxScale?: number; scaleStep?: number }): Plugin {
  const minScale = option?.minScale || 0.1;
  const maxScale = option?.maxScale || 5;
  const scaleStep = option?.scaleStep || 0.1;

  return {
    name: "scaleCanvasPlugin",
    wheel({ mouse, containerRect, zoom }) {
      const delta = mouse.deltaY > 0 ? -scaleStep : scaleStep;
      const newScale = Math.max(minScale, Math.min(maxScale, zoom + delta));

      if (newScale == zoom) return;
      const mouseX = mouse.moveX - containerRect.left;
      const mouseY = mouse.moveY - containerRect.top;
      const { x, y } = getZoomCenter(containerRect, mouse.moveX, mouse.moveY);

      const currentMouseX = (mouseX - this.translateX) / zoom;
      const currentMouseY = (mouseY - this.translateY) / zoom;

      this.translateX = mouseX - currentMouseX * newScale;
      this.translateY = mouseY - currentMouseY * newScale;
      this.scale = newScale;
    },
  };
}
