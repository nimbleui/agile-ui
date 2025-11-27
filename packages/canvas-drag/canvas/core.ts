import { CanvasState, CanvasAction, Plugin, PluginContext, Point } from "./types";
import { screenToCanvas } from "./utils/math";

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: CanvasState;
  private plugins: Plugin[] = [];
  private animationFrameId: number | null = null;
  private listeners: ((state: CanvasState) => void)[] = [];
  private api: Record<string, any> = {};

  constructor(canvas: HTMLCanvasElement, initialState?: Partial<CanvasState>) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get 2D context");
    this.ctx = context;

    this.state = {
      elements: [],
      selectedIds: [],
      hoveredId: null,
      scale: 1,
      offset: { x: 0, y: 0 },
      width: canvas.width,
      height: canvas.height,
      isDragging: false,
      dragStart: null,
      activeTool: "select",
      snapLines: [],
      ...initialState,
    };

    this.initEventListeners();
    this.startLoop();
  }

  public registerPlugin(plugin: Plugin) {
    this.plugins.push(plugin);
    if (plugin.onInit) {
      plugin.onInit(this.getContext());
    }
  }

  public dispatch = (action: CanvasAction) => {
    const newState = this.reducer(this.state, action);
    if (newState !== this.state) {
      this.state = newState;
      this.notifyListeners();
    }
  };

  public subscribe(listener: (state: CanvasState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): CanvasState {
    return this.state;
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.removeEventListeners();
    this.plugins.forEach((p) => p.onDestroy && p.onDestroy());
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.state = { ...this.state, width, height };
    this.render();
  }

  private getContext(): PluginContext {
    const engine = this;
    return {
      get state() {
        return engine.state;
      },
      dispatch: this.dispatch,
      canvas: this.canvas,
      ctx: this.ctx,
      api: this.api,
    };
  }

  private reducer(state: CanvasState, action: CanvasAction): CanvasState {
    switch (action.type) {
      case "UPDATE_ELEMENT":
        return {
          ...state,
          elements: state.elements.map((el) => (el.id === action.payload.id ? { ...el, ...action.payload } : el)),
        };
      case "ADD_ELEMENT":
        return {
          ...state,
          elements: [...state.elements, action.payload],
        };
      case "REMOVE_ELEMENT":
        return {
          ...state,
          elements: state.elements.filter((el) => el.id !== action.payload),
          selectedIds: state.selectedIds.filter((id) => id !== action.payload),
        };
      case "SELECT_ELEMENT":
        const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
        return {
          ...state,
          selectedIds: ids,
        };
      case "SET_HOVER":
        return {
          ...state,
          hoveredId: action.payload,
        };
      case "SET_CANVAS_TRANSFORM":
        return {
          ...state,
          scale: action.payload.scale ?? state.scale,
          offset: action.payload.offset ?? state.offset,
        };
      case "SET_TOOL":
        return {
          ...state,
          activeTool: action.payload,
        };
      case "SET_SNAP_LINES":
        return {
          ...state,
          snapLines: action.payload,
        };
      default:
        return state;
    }
  }

  private render() {
    const { ctx, canvas, state } = this;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply global transform
    ctx.translate(state.offset.x, state.offset.y);
    ctx.scale(state.scale, state.scale);

    // Delegate rendering to plugins
    const context = this.getContext();
    this.plugins.forEach((plugin) => {
      if (plugin.onRender) {
        ctx.save();
        plugin.onRender(context);
        ctx.restore();
      }
    });

    ctx.restore();
  }

  private startLoop() {
    const loop = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private handleEvent(handlerName: "onMouseDown" | "onMouseMove" | "onMouseUp" | "onKeyDown", e: Event) {
    const context = this.getContext();
    for (const plugin of this.plugins) {
      const handler = plugin[handlerName];
      if (handler) {
        handler(e, context);
        if (e.defaultPrevented) break;
      }
    }
  }

  private onMouseDown = (e: MouseEvent) => this.handleEvent("onMouseDown", e);
  private onMouseMove = (e: MouseEvent) => this.handleEvent("onMouseMove", e);
  private onMouseUp = (e: MouseEvent) => this.handleEvent("onMouseUp", e);
  private onKeyDown = (e: KeyboardEvent) => this.handleEvent("onKeyDown", e);

  private initEventListeners() {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("keydown", this.onKeyDown);
  }

  private removeEventListeners() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("keydown", this.onKeyDown);
  }
}
