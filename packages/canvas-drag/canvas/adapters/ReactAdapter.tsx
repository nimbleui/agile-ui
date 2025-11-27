import { useEffect, useRef, useState } from "react";
import { CanvasEngine } from "../core";
import { RenderPlugin } from "../plugins/RenderPlugin";
import { SelectPlugin } from "../plugins/SelectPlugin";
import { DragPlugin } from "../plugins/DragPlugin";
import { TransformPlugin } from "../plugins/TransformPlugin";
import { SnapPlugin } from "../plugins/SnapPlugin";
import { CollisionPlugin } from "../plugins/CollisionPlugin";
import { CanvasState } from "../types";

export const useCanvasEditor = (initialState?: Partial<CanvasState>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const [state, setState] = useState<CanvasState | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CanvasEngine(canvasRef.current, initialState);

    // Register default plugins
    // Order matters for event handling!
    engine.registerPlugin(RenderPlugin);
    engine.registerPlugin(TransformPlugin); // Transform first to catch handles
    engine.registerPlugin(SelectPlugin); // Then Select
    engine.registerPlugin(DragPlugin); // Then Drag
    engine.registerPlugin(SnapPlugin);
    engine.registerPlugin(CollisionPlugin);

    // Subscribe to state changes
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });

    engineRef.current = engine;
    setState(engine.getState());

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        engine.resize(width, height);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      unsubscribe();
      engine.destroy();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    canvasRef,
    engine: engineRef.current,
    state,
  };
};
