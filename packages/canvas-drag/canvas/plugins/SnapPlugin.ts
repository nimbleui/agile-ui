import { Plugin, PluginContext, SnapLine, CanvasElement } from "../types";

const SNAP_THRESHOLD = 5;

export const SnapPlugin: Plugin = {
  name: "SnapPlugin",

  onInit: (context: PluginContext) => {
    // Expose snap function to other plugins
    context.api.snap = (
      element: CanvasElement,
      dx: number,
      dy: number,
      otherElements: CanvasElement[],
    ): { x: number; y: number; lines: SnapLine[] } => {
      const proposedX = element.x + dx;
      const proposedY = element.y + dy;
      const width = element.width;
      const height = element.height;

      let snappedX = proposedX;
      let snappedY = proposedY;
      const lines: SnapLine[] = [];

      // Points of interest on the moving element (Left, Center, Right / Top, Middle, Bottom)
      const hPoints = [proposedX, proposedX + width / 2, proposedX + width];
      const vPoints = [proposedY, proposedY + height / 2, proposedY + height];

      // Check against all other elements
      otherElements.forEach((target) => {
        if (target.id === element.id) return;

        const tHPoints = [target.x, target.x + target.width / 2, target.x + target.width];
        const tVPoints = [target.y, target.y + target.height / 2, target.y + target.height];

        // Horizontal Snap (Vertical Lines)
        hPoints.forEach((h, i) => {
          tHPoints.forEach((th) => {
            if (Math.abs(h - th) < SNAP_THRESHOLD) {
              const diff = th - h;
              snappedX += diff;
              lines.push({
                type: "vertical",
                position: th,
                start: Math.min(proposedY, target.y),
                end: Math.max(proposedY + height, target.y + target.height),
              });
            }
          });
        });

        // Vertical Snap (Horizontal Lines)
        vPoints.forEach((v, i) => {
          tVPoints.forEach((tv) => {
            if (Math.abs(v - tv) < SNAP_THRESHOLD) {
              const diff = tv - v;
              snappedY += diff;
              lines.push({
                type: "horizontal",
                position: tv,
                start: Math.min(proposedX, target.x),
                end: Math.max(proposedX + width, target.x + target.width),
              });
            }
          });
        });
      });

      return { x: snappedX, y: snappedY, lines };
    };
  },

  onRender: (context: PluginContext) => {
    const { ctx, state } = context;
    if (state.snapLines.length === 0) return;

    ctx.save();
    ctx.strokeStyle = "#ef4444"; // Red-500
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    state.snapLines.forEach((line) => {
      ctx.beginPath();
      if (line.type === "vertical") {
        ctx.moveTo(line.position, line.start);
        ctx.lineTo(line.position, line.end);
      } else {
        ctx.moveTo(line.start, line.position);
        ctx.lineTo(line.end, line.position);
      }
      ctx.stroke();
    });

    ctx.restore();
  },

  onMouseUp: (e: MouseEvent, context: PluginContext) => {
    // Clear snap lines on drop
    context.dispatch({ type: "SET_SNAP_LINES", payload: [] });
  },
};
