export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  selected?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  content?: any; // For custom content
  style?: Record<string, any>;
  type?: string; // 'text', 'image', 'rect', etc.
}

export interface SnapLine {
  type: "horizontal" | "vertical";
  position: number; // x or y value
  start: number;
  end: number;
  distance?: number;
}

export interface CanvasConfig {
  width?: number;
  height?: number;
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  snapThreshold?: number; // Distance to snap
  readonly?: boolean;
  zoom?: number;
}

export type EventCallback = (data: any) => void;

export interface ICanvasController {
  init(container: HTMLElement): void;
  destroy(): void;
  addElement(element: Partial<ElementState>): void;
  removeElement(id: string): void;
  updateElement(id: string, state: Partial<ElementState>): void;
  getElements(): ElementState[];
  getElementById(id: string): ElementState | undefined;
  on(event: string, callback: EventCallback): void;
  off(event: string, callback: EventCallback): void;
  setSelected(ids: string[]): void;
  getSelectedIds(): string[];
  getSelectionBounds(): { x: number; y: number; width: number; height: number; rotation: number } | null;
  setZoom(zoom: number): void;
  getSnapLines(): SnapLine[];
}
