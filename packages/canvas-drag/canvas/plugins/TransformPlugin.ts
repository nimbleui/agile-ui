import { Plugin, PluginContext, Point, CanvasElement } from "../types";
import { screenToCanvas, getCenter, rotatePoint, degreesToRadians, getCorners } from "../utils/math";

type TransformMode = "scale" | "rotate" | null;
type HandleType = "tl" | "tr" | "br" | "bl" | "rotate";

interface TransformState {
  isTransforming: boolean;
  mode: TransformMode;
  handle: HandleType | null;
  startPoint: Point;
  startElement: CanvasElement | null;
}

// Local state for the plugin
let transformState: TransformState = {
  isTransforming: false,
  mode: null,
  handle: null,
  startPoint: { x: 0, y: 0 },
  startElement: null,
};

const HANDLE_SIZE = 8;
const ROTATE_HANDLE_OFFSET = 25;

export const TransformPlugin: Plugin = {
  name: "TransformPlugin",

  onRender: (context: PluginContext) => {
    const { ctx, state } = context;
    // Only draw handles if one element is selected (for now, group transform is harder)
    if (state.selectedIds.length !== 1) return;

    const element = state.elements.find((el) => el.id === state.selectedIds[0]);
    if (!element) return;

    const center = getCenter(element);

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(degreesToRadians(element.rotation));
    ctx.translate(-center.x, -center.y);

    const { x, y, width, height } = element;

    // Draw handles
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1;

    const handles = [
      { x, y, type: "tl" },
      { x: x + width, y, type: "tr" },
      { x: x + width, y: y + height, type: "br" },
      { x, y: y + height, type: "bl" },
    ];

    handles.forEach((h) => {
      ctx.beginPath();
      ctx.rect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.fill();
      ctx.stroke();
    });

    // Rotate handle
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y - ROTATE_HANDLE_OFFSET);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + width / 2, y - ROTATE_HANDLE_OFFSET, HANDLE_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

  onMouseDown: (e: MouseEvent, context: PluginContext) => {
    const { state, canvas } = context;
    if (state.selectedIds.length !== 1) return;

    const element = state.elements.find((el) => el.id === state.selectedIds[0]);
    if (!element || element.locked) return;

    const rect = canvas.getBoundingClientRect();
    const mousePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const p = screenToCanvas(mousePoint, state.offset, state.scale);

    // Check handles
    // We need to check in local unrotated space
    const center = getCenter(element);
    const localP = rotatePoint(p, center, -element.rotation);

    const { x, y, width, height } = element;
    const hs = HANDLE_SIZE / 2 + 2; // Hit area

    let handle: HandleType | null = null;

    if (Math.abs(localP.x - x) <= hs && Math.abs(localP.y - y) <= hs) handle = "tl";
    else if (Math.abs(localP.x - (x + width)) <= hs && Math.abs(localP.y - y) <= hs) handle = "tr";
    else if (Math.abs(localP.x - (x + width)) <= hs && Math.abs(localP.y - (y + height)) <= hs) handle = "br";
    else if (Math.abs(localP.x - x) <= hs && Math.abs(localP.y - (y + height)) <= hs) handle = "bl";
    else if (Math.abs(localP.x - (x + width / 2)) <= hs && Math.abs(localP.y - (y - ROTATE_HANDLE_OFFSET)) <= hs)
      handle = "rotate";

    if (handle) {
      e.preventDefault(); // Stop other plugins (Select, Drag)
      e.stopPropagation();
      transformState = {
        isTransforming: true,
        mode: handle === "rotate" ? "rotate" : "scale",
        handle,
        startPoint: p,
        startElement: { ...element },
      };
    }
  },

  onMouseMove: (e: MouseEvent, context: PluginContext) => {
    if (!transformState.isTransforming || !transformState.startElement) return;

    const { dispatch, canvas, state } = context;
    const rect = canvas.getBoundingClientRect();
    const mousePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const p = screenToCanvas(mousePoint, state.offset, state.scale);
    const el = transformState.startElement;
    const center = getCenter(el);

    if (transformState.mode === "rotate") {
      // Calculate angle
      const startAngle = Math.atan2(transformState.startPoint.y - center.y, transformState.startPoint.x - center.x);
      const currentAngle = Math.atan2(p.y - center.y, p.x - center.x);
      const deltaAngle = radiansToDegrees(currentAngle - startAngle);

      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          id: el.id,
          rotation: (el.rotation + deltaAngle) % 360,
        },
      });
    } else if (transformState.mode === "scale") {
      // Scaling logic with fixed opposite corner
      // 1. Identify fixed corner (anchor)
      // 2. Rotate mouse point to local space relative to anchor? No.
      // Easier:
      // Rotate mouse point to unrotated space relative to center
      // Calculate new width/height
      // Recalculate center

      // Let's use the "unrotated box" approach
      // Convert current mouse P to local unrotated space
      const localP = rotatePoint(p, center, -el.rotation);
      const localStart = rotatePoint(transformState.startPoint, center, -el.rotation);

      const dx = localP.x - localStart.x;
      const dy = localP.y - localStart.y;

      let newX = el.x;
      let newY = el.y;
      let newW = el.width;
      let newH = el.height;

      switch (transformState.handle) {
        case "br":
          newW += dx;
          newH += dy;
          break;
        case "tr":
          newW += dx;
          newY += dy;
          newH -= dy;
          break;
        case "bl":
          newX += dx;
          newW -= dx;
          newH += dy;
          break;
        case "tl":
          newX += dx;
          newW -= dx;
          newY += dy;
          newH -= dy;
          break;
      }

      // Constrain min size
      if (newW < 10) newW = 10;
      if (newH < 10) newH = 10;

      // Now we have the new unrotated box (newX, newY, newW, newH)
      // But this box is in the coordinate system of the OLD center.
      // We need to adjust the position so that the ANCHOR point remains fixed in world space.

      // Actually, the simple logic above (modifying x, y, w, h) works for unrotated boxes.
      // For rotated boxes, modifying x/y/w/h directly in local space implies the center moves in local space.
      // We need to map this back to world space.

      // Re-calculate the new center in local space
      const newLocalCenter = {
        x: newX + newW / 2,
        y: newY + newH / 2,
      };

      // The "old" local center was {x: el.x + el.width/2, y: ...} which was (0,0) relative to rotation?
      // No, `rotatePoint` uses `center` as pivot.

      // Let's simplify:
      // The `localP` calculation effectively projects the mouse delta onto the element's axes.
      // `newX`, `newY`, `newW`, `newH` describe the new bounding box in the element's LOCAL coordinate system.
      // To get the new world position, we take the new local center, rotate it by the element's rotation, and add it to the original center?
      // No.

      // Correct approach for "Rotation then Scale":
      // 1. Calculate new dimensions and position in LOCAL space (as done above).
      // 2. Calculate the shift of the center in LOCAL space.
      // 3. Rotate that shift vector to WORLD space.
      // 4. Apply that world shift to the original center to get the new world center.
      // 5. Calculate new world x,y from new world center and new dimensions.

      const oldLocalCenter = {
        x: el.x + el.width / 2,
        y: el.y + el.height / 2,
      };

      const localCenterShift = {
        x: newLocalCenter.x - oldLocalCenter.x,
        y: newLocalCenter.y - oldLocalCenter.y,
      };

      // Rotate shift vector
      // We rotate the shift vector by the element's rotation
      const rad = degreesToRadians(el.rotation);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const worldShift = {
        x: localCenterShift.x * cos - localCenterShift.y * sin,
        y: localCenterShift.x * sin + localCenterShift.y * cos,
      };

      const newWorldCenter = {
        x: center.x + worldShift.x,
        y: center.y + worldShift.y,
      };

      const finalX = newWorldCenter.x - newW / 2;
      const finalY = newWorldCenter.y - newH / 2;

      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          id: el.id,
          x: finalX,
          y: finalY,
          width: newW,
          height: newH,
        },
      });
    }
  },

  onMouseUp: () => {
    transformState.isTransforming = false;
    transformState.startElement = null;
  },
};
