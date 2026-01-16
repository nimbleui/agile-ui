import { Plugin } from "../types";

export function dragCanvasPlugin(): Plugin {
  const dis = { x: 0, y: 0 };
  return {
    name: "dragCanvasPlugin",
    keyCode: "space",
    cursor: (type) => (type == "keyDown" ? "grab" : type == "keyUp" ? "" : "grabbing"),
    down({ translateX, translateY }) {
      dis.x = translateX;
      dis.y = translateY;
    },
    move({ mouse, zoom, dispatch }) {
      const { disX, disY } = mouse;
      dispatch("UPDATE_ZOOM", { x: disX * zoom + dis.x, y: disY * zoom + dis.y, zoom });
    },
  };
}
