import { Plugin } from "../types";

/**
 * 画布缩放插件
 * @param option
 * @returns
 */
export function scaleCanvasPlugin(option?: {
  /** 最小的缩放比例 */
  minScale?: number;
  /** 最大的缩放比例 */
  maxScale?: number;
  /** 每次缩放的步长 */
  scaleStep?: number;
  /** 配合按键，值是去key值，空格会转成space其他不变，-1代表没有按键也执行，组合：ctrl+a，多种："ctrl+a,alt" */
  keyCode?: string;
}): Plugin {
  const minScale = option?.minScale || 0.1;
  const maxScale = option?.maxScale || 5;
  const scaleStep = option?.scaleStep || 0.1;
  const keyCode = option?.keyCode || "control";

  return {
    name: "scaleCanvasPlugin",
    keyCode,
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
