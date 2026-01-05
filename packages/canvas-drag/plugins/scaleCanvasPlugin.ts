import { Plugin } from "../types";

export function scaleCanvasPlugin(option?: { minScale?: number; maxScale?: number; scaleStep?: number }): Plugin {
  const minScale = option?.minScale || 0.1;
  const maxScale = option?.maxScale || 5;
  const scaleStep = option?.scaleStep || 0.1;
  const transform = { zoom: 0, x: 0, y: 0 };

  return {
    name: "scaleCanvasPlugin",
    wheel({ mouse, containerRect, zoom, dispatch }) {
      const mouseX = mouse.startX;
      const mouseY = mouse.startY;
      const { left, top, width, height } = containerRect;

      const isInside = mouseX >= left && mouseX <= left + width && mouseY >= top && mouseY <= height + top;
      const originX = isInside ? mouseX : left + width / 2;
      const originY = isInside ? mouseY : top + height / 2;

      const delta = -Math.sign(mouse.deltaY) * scaleStep;
      const newScale = Math.min(Math.max(zoom + delta, minScale), maxScale);
      if (newScale === zoom) return;

      const scaleRatio = newScale / zoom;
      const newTransform = {
        zoom: newScale,
        x: transform.x + (originX - left) * (1 - scaleRatio),
        y: transform.y + (originY - top) * (1 - scaleRatio),
      };
      Object.assign(transform, newTransform);
      dispatch("UPDATE_ZOOM", newTransform);
    },
  };
}
