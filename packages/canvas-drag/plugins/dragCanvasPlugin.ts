import { Plugin } from "../types";

export function dragCanvasPlugin(): Plugin {
  const dis = { x: 0, y: 0 };
  return {
    name: "dragCanvasPlugin",
    keyCode: "space",
    down({ translateX, translateY }) {
      dis.x = translateX;
      dis.y = translateY;
    },
    move({ mouse, zoom, dispatch }) {
      const { disX, disY } = mouse;
      dispatch("UPDATE_ZOOM", { x: disX + dis.x, y: disY + dis.y, zoom });
    },
  };
}
