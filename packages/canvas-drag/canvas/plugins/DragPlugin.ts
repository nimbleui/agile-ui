import { Plugin, PluginContext, Point } from "../types";
import { screenToCanvas } from "../utils/math";

interface DragState {
  isDragging: boolean;
  lastPos: Point | null;
}

const dragState: DragState = {
  isDragging: false,
  lastPos: null,
};

export const DragPlugin: Plugin = {
  name: "DragPlugin",

  onMouseDown: (e: MouseEvent, context: PluginContext) => {
    if (e.defaultPrevented) return;

    const { state, canvas } = context;
    // Use fresh state from getter
    if (state.activeTool !== "select" || state.selectedIds.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mousePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const canvasPoint = screenToCanvas(mousePoint, state.offset, state.scale);

    dragState.isDragging = true;
    dragState.lastPos = canvasPoint;
  },

  onMouseMove: (e: MouseEvent, context: PluginContext) => {
    if (!dragState.isDragging || !dragState.lastPos) return;

    const { state, dispatch, canvas, api } = context;
    const rect = canvas.getBoundingClientRect();
    const mousePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const canvasPoint = screenToCanvas(mousePoint, state.offset, state.scale);
    const lastPos = dragState.lastPos;

    const dx = canvasPoint.x - lastPos.x;
    const dy = canvasPoint.y - lastPos.y;

    // Optimization: Don't dispatch if no movement
    if (dx === 0 && dy === 0) return;

    // If dragging single element, try snapping
    if (state.selectedIds.length === 1 && api.snap) {
      const element = state.elements.find((el) => el.id === state.selectedIds[0]);
      if (element && !element.locked) {
        const snapResult = api.snap(element, dx, dy, state.elements);

        dispatch({
          type: "UPDATE_ELEMENT",
          payload: {
            id: element.id,
            x: snapResult.x,
            y: snapResult.y,
          },
        });

        dispatch({ type: "SET_SNAP_LINES", payload: snapResult.lines });
      }
    } else {
      // Multi-drag (no snap for now)
      state.selectedIds.forEach((id) => {
        const element = state.elements.find((el) => el.id === id);
        if (element && !element.locked) {
          dispatch({
            type: "UPDATE_ELEMENT",
            payload: {
              id,
              x: element.x + dx,
              y: element.y + dy,
            },
          });
        }
      });
      dispatch({ type: "SET_SNAP_LINES", payload: [] });
    }

    dragState.lastPos = canvasPoint;
  },

  onMouseUp: (e: MouseEvent, context: PluginContext) => {
    dragState.isDragging = false;
    dragState.lastPos = null;
    context.dispatch({ type: "SET_SNAP_LINES", payload: [] });
  },
};
