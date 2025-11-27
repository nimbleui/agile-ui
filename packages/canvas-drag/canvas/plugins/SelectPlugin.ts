import { Plugin, PluginContext } from "../types";
import { isPointInRect, screenToCanvas } from "../utils/math";

export const SelectPlugin: Plugin = {
  name: "SelectPlugin",
  onMouseDown: (e: MouseEvent, context: PluginContext) => {
    if (e.defaultPrevented) return; // Skip if handled by other plugins (e.g. Transform)

    const { state, dispatch, canvas } = context;
    if (state.activeTool !== "select") return;

    const rect = canvas.getBoundingClientRect();
    const mousePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const canvasPoint = screenToCanvas(mousePoint, state.offset, state.scale);

    // Find clicked element (reverse to hit top-most first)
    const clickedElement = [...state.elements].reverse().find((el) => isPointInRect(canvasPoint, el));

    if (clickedElement) {
      if (e.shiftKey) {
        // Toggle selection
        const newSelection = state.selectedIds.includes(clickedElement.id)
          ? state.selectedIds.filter((id) => id !== clickedElement.id)
          : [...state.selectedIds, clickedElement.id];
        dispatch({ type: "SELECT_ELEMENT", payload: newSelection });
      } else {
        // If already selected, don't change selection (allows dragging group)
        // Unless it's the ONLY selected item, then it's a no-op.
        if (!state.selectedIds.includes(clickedElement.id)) {
          dispatch({ type: "SELECT_ELEMENT", payload: [clickedElement.id] });
        }
      }
    } else {
      // Clicked empty space, deselect all
      dispatch({ type: "SELECT_ELEMENT", payload: [] });
    }
  },
};
