import { Plugin } from "../types";

export const dragPlugin: Plugin = {
  name: "dragPlugin",
  down(context) {
    console.log(context);
  },
  move({ mouse, dispatch }) {
    const { disY, disX } = mouse;

    dispatch({
      type: "APPEND_SITE",
      payload: { disX, disY },
    });
  },
};
