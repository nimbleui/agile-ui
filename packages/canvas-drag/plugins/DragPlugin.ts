import { Plugin } from "../types";

export const DragPlugin: Plugin = {
  name: "DragPlugin",
  before: (context) => context.handle == "drag",
  down(e, context) {
    const { handle } = context;
    console.log(handle);
  },
};
