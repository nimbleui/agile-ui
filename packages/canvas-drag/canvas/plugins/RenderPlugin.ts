import { Plugin, PluginContext, CanvasElement } from "../types";
import { getCenter } from "../utils/math";

export const RenderPlugin: Plugin = {
  name: "RenderPlugin",
  onRender: (context: PluginContext) => {
    const { ctx, state } = context;

    // Sort by zIndex
    const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);

    sortedElements.forEach((element) => {
      ctx.save();

      const center = getCenter(element);

      // Translate to center, rotate, translate back
      ctx.translate(center.x, center.y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-center.x, -center.y);

      // Draw based on type
      if (element.type === "rect") {
        if (element.fill) {
          ctx.fillStyle = element.fill;
          ctx.fillRect(element.x, element.y, element.width, element.height);
        }
        if (element.stroke) {
          ctx.strokeStyle = element.stroke;
          ctx.lineWidth = 2;
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
      } else if (element.type === "text" && element.content) {
        ctx.font = `${element.height}px sans-serif`;
        ctx.fillStyle = element.fill || "#000";
        ctx.textBaseline = "top";
        ctx.fillText(element.content, element.x, element.y);
      }
      // TODO: Image support

      // Draw selection outline
      if (state.selectedIds.includes(element.id)) {
        ctx.strokeStyle = "#3b82f6"; // Blue-500
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);

        // Draw rotation handle (top center) - MOVED TO TransformPlugin
        // ctx.beginPath();
        // ctx.moveTo(element.x + element.width / 2, element.y);
        // ctx.lineTo(element.x + element.width / 2, element.y - 20);
        // ctx.stroke();
        // ctx.fillStyle = '#fff';
        // ctx.beginPath();
        // ctx.arc(element.x + element.width / 2, element.y - 20, 4, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.stroke();
      }

      ctx.restore();
    });
  },
};
