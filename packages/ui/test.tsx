import React, { useMemo, useId } from "react";
import { motion } from "framer-motion";

export type Point = { x: number; y: number };
export type LineType = "straight" | "curve" | "right-angle";

interface ConnectionLineProps {
  start: Point;
  end: Point;
  type?: LineType;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
  className?: string;
  curvature?: number; // For curve type
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  type = "curve",
  color = "#3b82f6",
  strokeWidth = 2,
  animated = false,
  className = "",
  curvature = 0.5,
}) => {
  const uniqueId = useId();
  const markerId = `arrowhead-${uniqueId}`;
  const gradientId = `gradient-${uniqueId}`;

  const path = useMemo(() => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    switch (type) {
      case "straight":
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      case "curve": {
        // Calculate control points for a smooth Bezier curve
        // We assume a horizontal flow preference by default, but can adapt
        // A simple approach is to use the distance to determine the control point offset
        const cpOffset = Math.abs(deltaX) * curvature;

        // If points are vertically aligned more than horizontally, we might want to adjust logic
        // But standard node-link diagrams usually use horizontal CPs
        const cp1 = { x: start.x + cpOffset, y: start.y };
        const cp2 = { x: end.x - cpOffset, y: end.y };

        // If the points are very close or inverted, we might want a fixed minimum offset
        // or handle vertical cases. For now, let's stick to horizontal curvature.

        return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${end.x} ${end.y}`;
      }

      case "right-angle": {
        // Orthogonal routing (Manhattan)
        // Simple strategy: Horizontal then Vertical then Horizontal
        const midX = start.x + (end.x - start.x) / 2;
        return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
      }

      default:
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }
  }, [start, end, type, curvature]);

  // Calculate bounds for the SVG to ensure it covers the area
  // We add some padding to avoid clipping stroke
  const padding = strokeWidth * 4;
  const minX = Math.min(start.x, end.x) - padding;
  const minY = Math.min(start.y, end.y) - padding;
  const maxX = Math.max(start.x, end.x) + padding;
  const maxY = Math.max(start.y, end.y) + padding;
  const width = maxX - minX;
  const height = maxY - minY;

  // We need to translate the path coordinates to be relative to the SVG viewbox
  // OR we can just use a full-screen SVG overlay.
  // Using a full-screen overlay is often easier for connecting arbitrary elements on a page.
  // However, if this component is meant to be self-contained, it should probably be an SVG
  // that positions itself.

  // Let's assume the parent provides a coordinate system (like a relative container).
  // If we render an SVG for just this line, we need to position the SVG absolutely
  // or use a large SVG container for all lines.

  // Strategy: Render a path. The consumer should probably wrap this in a common SVG
  // if drawing multiple lines, OR this component renders an SVG that covers the bounding box.
  // Let's go with the "SVG covering bounding box" approach for isolation,
  // but "Full container" is better for multiple lines.

  // Given the user request "draw a line between two points", usually implies these points
  // are in a common coordinate space.
  // I will render an SVG that assumes `start` and `end` are in the local coordinate space of the SVG.
  // The user of this component should place it inside a container where these coordinates make sense.

  return (
    <svg className={`pointer-events-none absolute top-0 left-0 w-full h-full overflow-visible z-0 ${className}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <marker id={markerId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>

      {/* Background Line (for hover/click area if needed, or just visual weight) */}
      <path d={path} stroke={color} strokeWidth={strokeWidth} fill="none" strokeOpacity={0.2} />

      {/* Main Line */}
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        initial={false}
        animate={
          animated
            ? {
                strokeDasharray: "10 5",
                strokeDashoffset: [0, -15],
              }
            : {
                strokeDasharray: "none",
                strokeDashoffset: 0,
              }
        }
        transition={
          animated
            ? {
                repeat: Infinity,
                ease: "linear",
                duration: 1,
              }
            : {
                duration: 0,
              }
        }
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  );
};
