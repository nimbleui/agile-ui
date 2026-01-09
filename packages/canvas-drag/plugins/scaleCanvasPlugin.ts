import { Plugin } from "../types";

export function scaleCanvasPlugin(option?: { minScale?: number; maxScale?: number; scaleStep?: number }): Plugin {
  const minScale = option?.minScale || 0.1;
  const maxScale = option?.maxScale || 5;
  const scaleStep = option?.scaleStep || 0.1;

  return {
    name: "scaleCanvasPlugin",
    keyCode: "control",
    wheel({ mouse, containerRect, translateX, translateY, zoom, dispatch }) {
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
        x: translateX + (originX - left) * (1 - scaleRatio),
        y: translateY + (originY - top) * (1 - scaleRatio),
      };
      dispatch("UPDATE_ZOOM", newTransform);
    },
  };
}
