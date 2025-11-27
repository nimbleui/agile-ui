import { EventEmitter } from "./EventEmitter";
import { ElementState, CanvasConfig, Point, SnapLine } from "./types";

export class CanvasController extends EventEmitter {
  private container: HTMLElement | null = null;
  private elements: ElementState[] = [];
  private snapLines: SnapLine[] = [];
  private config: CanvasConfig = {
    gridSize: 10,
    showGrid: true,
    snapToGrid: false,
    snapThreshold: 5,
    readonly: false,
    zoom: 1,
  };

  private selectedIds: string[] = [];
  private dragging: boolean = false;
  private resizing: boolean = false;
  private rotating: boolean = false;
  private isSelecting: boolean = false;
  private selectionBox: { x: number; y: number; width: number; height: number } | null = null;

  private startPoint: Point = { x: 0, y: 0 };
  private startElementStates: Record<string, ElementState> = {};
  private activeHandle: string | null = null;

  private groupCenter: Point = { x: 0, y: 0 };
  private startAngle: number = 0;

  constructor(config?: Partial<CanvasConfig>) {
    super();
    if (config) {
      this.config = { ...this.config, ...config };
    }
    // Mock data
    this.elements = [
      {
        id: "1",
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: 1,
        type: "rect",
        style: { backgroundColor: "#ff5555" },
      },
      {
        id: "2",
        x: 300,
        y: 150,
        width: 150,
        height: 100,
        rotation: 0,
        zIndex: 2,
        type: "rect",
        style: { backgroundColor: "#5555ff" },
      },
      {
        id: "3",
        x: 500,
        y: 100,
        width: 100,
        height: 100,
        rotation: 45,
        zIndex: 3,
        type: "rect",
        style: { backgroundColor: "#55ff55" },
      },
    ];
  }

  init(container: HTMLElement) {
    this.container = container;
    this.bindEvents();
    this.emit("init", this);
    this.emit("change", this.elements);
  }

  destroy() {
    this.unbindEvents();
    this.container = null;
    this.emit("destroy", this);
  }

  getElements() {
    return this.elements;
  }

  getSnapLines() {
    return this.snapLines;
  }

  getSelectionBox() {
    return this.selectionBox;
  }

  getElementById(id: string) {
    return this.elements.find((el) => el.id === id);
  }

  setElements(elements: ElementState[]) {
    this.elements = elements;
    this.emit("change", this.elements);
  }

  addElement(element: Partial<ElementState>) {
    const newElement: ElementState = {
      id: element.id || Math.random().toString(36).substr(2, 9),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: this.elements.length + 1,
      ...element,
    };
    this.elements.push(newElement);
    this.emit("change", this.elements);
  }

  removeElement(id: string) {
    this.elements = this.elements.filter((el) => el.id !== id);
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter((sid) => sid !== id);
      this.emit("selectionChange", this.selectedIds);
    }
    this.emit("change", this.elements);
  }

  updateElement(id: string, state: Partial<ElementState>) {
    const index = this.elements.findIndex((el) => el.id === id);
    if (index !== -1) {
      this.elements[index] = { ...this.elements[index], ...state };
      this.emit("change", this.elements);
    }
  }

  setSelected(ids: string[]) {
    this.selectedIds = ids;
    this.elements = this.elements.map((el) => ({ ...el, selected: ids.includes(el.id) }));
    this.emit("selectionChange", ids);
    this.emit("change", this.elements);
  }

  getSelectedIds() {
    return this.selectedIds;
  }

  getSelectionBounds() {
    if (this.selectedIds.length === 0) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    this.selectedIds.forEach((id) => {
      const el = this.getElementById(id);
      if (el) {
        const corners = this.getElementCorners(el);
        corners.forEach((p) => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
      }
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
    };
  }

  private getElementCorners(el: ElementState) {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const w = el.width / 2;
    const h = el.height / 2;
    const rad = el.rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [
      { x: cx + (-w * cos - -h * sin), y: cy + (-w * sin + -h * cos) }, // TL
      { x: cx + (w * cos - -h * sin), y: cy + (w * sin + -h * cos) }, // TR
      { x: cx + (w * cos - h * sin), y: cy + (w * sin + h * cos) }, // BR
      { x: cx + (-w * cos - h * sin), y: cy + (-w * sin + h * cos) }, // BL
    ];
  }

  private getBoundingBox(el: ElementState) {
    const corners = this.getElementCorners(el);
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    corners.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: el.x + el.width / 2,
      centerY: el.y + el.height / 2,
    };
  }

  setZoom(zoom: number) {
    this.config.zoom = zoom;
  }

  private bindEvents() {
    if (!this.container) return;
    this.container.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  private unbindEvents() {
    if (!this.container) return;
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (this.config.readonly) return;

    const target = e.target as HTMLElement;
    const handle = target.dataset.dragHandle;
    const isGroupDrag = target.dataset.dragGroup;
    const elementId = target.closest("[data-element-id]")?.getAttribute("data-element-id");

    this.startElementStates = {};
    this.selectedIds.forEach((id) => {
      const el = this.getElementById(id);
      if (el) this.startElementStates[id] = { ...el };
    });

    if (handle === "rotate" && this.selectedIds.length > 0) {
      this.rotating = true;
      this.startPoint = { x: e.clientX, y: e.clientY };

      const bounds = this.getSelectionBounds();
      if (bounds) {
        this.groupCenter = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
        const zoom = this.config.zoom || 1;
        const rect = this.container!.getBoundingClientRect();
        const cx = rect.left + this.groupCenter.x * zoom;
        const cy = rect.top + this.groupCenter.y * zoom;
        this.startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
      }
      e.preventDefault();
      e.stopPropagation();
    } else if (isGroupDrag && this.selectedIds.length > 0) {
      this.dragging = true;
      this.startPoint = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      e.stopPropagation();
    } else if (handle && this.selectedIds.length > 0) {
      this.resizing = true;
      this.activeHandle = handle;
      this.startPoint = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      e.stopPropagation();
    } else if (elementId) {
      if (e.shiftKey) {
        if (this.selectedIds.includes(elementId)) {
          this.setSelected(this.selectedIds.filter((id) => id !== elementId));
        } else {
          this.setSelected([...this.selectedIds, elementId]);
        }
      } else {
        if (!this.selectedIds.includes(elementId)) {
          this.setSelected([elementId]);
        }
      }

      this.startElementStates = {};
      this.selectedIds.forEach((id) => {
        const el = this.getElementById(id);
        if (el) this.startElementStates[id] = { ...el };
      });

      this.dragging = true;
      this.startPoint = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      e.stopPropagation();
    } else {
      if (!e.shiftKey) {
        this.setSelected([]);
      }
      this.isSelecting = true;
      this.startPoint = { x: e.clientX, y: e.clientY };
      const zoom = this.config.zoom || 1;
      const rect = this.container!.getBoundingClientRect();
      const wx = (e.clientX - rect.left) / zoom;
      const wy = (e.clientY - rect.top) / zoom;
      this.selectionBox = { x: wx, y: wy, width: 0, height: 0 };
      this.emit("selectionBox", this.selectionBox);
      e.preventDefault();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.dragging && !this.resizing && !this.rotating && !this.isSelecting) return;

    const zoom = this.config.zoom || 1;
    const dx = (e.clientX - this.startPoint.x) / zoom;
    const dy = (e.clientY - this.startPoint.y) / zoom;

    if (this.dragging) {
      this.selectedIds.forEach((id) => {
        const startState = this.startElementStates[id];
        if (startState) {
          let newX = startState.x + dx;
          let newY = startState.y + dy;

          if (this.selectedIds.length === 1) {
            const snapped = this.checkSnap(newX, newY, startState.width, startState.height, id);
            newX = snapped.x;
            newY = snapped.y;
          }

          this.updateElement(id, { x: newX, y: newY });
        }
      });
    } else if (this.resizing && this.activeHandle) {
      if (this.selectedIds.length === 1) {
        this.handleResize(dx, dy, this.selectedIds[0]);
      }
    } else if (this.rotating) {
      this.handleGroupRotate(e.clientX, e.clientY);
    } else if (this.isSelecting && this.selectionBox && this.container) {
      const rect = this.container.getBoundingClientRect();
      const currentWx = (e.clientX - rect.left) / zoom;
      const currentWy = (e.clientY - rect.top) / zoom;

      const startWx = (this.startPoint.x - rect.left) / zoom;
      const startWy = (this.startPoint.y - rect.top) / zoom;

      const x = Math.min(startWx, currentWx);
      const y = Math.min(startWy, currentWy);
      const width = Math.abs(currentWx - startWx);
      const height = Math.abs(currentWy - startWy);

      this.selectionBox = { x, y, width, height };
      this.emit("selectionBox", this.selectionBox);
    }
  };

  private handleGroupRotate(mx: number, my: number) {
    if (!this.container) return;

    const zoom = this.config.zoom || 1;
    const rect = this.container.getBoundingClientRect();
    const cx = rect.left + this.groupCenter.x * zoom;
    const cy = rect.top + this.groupCenter.y * zoom;

    const currentAngle = Math.atan2(my - cy, mx - cx);
    const angleDiff = (currentAngle - this.startAngle) * (180 / Math.PI);

    this.selectedIds.forEach((id) => {
      const startState = this.startElementStates[id];
      if (startState) {
        const elCx = startState.x + startState.width / 2;
        const elCy = startState.y + startState.height / 2;

        const relX = elCx - this.groupCenter.x;
        const relY = elCy - this.groupCenter.y;

        const rad = angleDiff * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const newRelX = relX * cos - relY * sin;
        const newRelY = relX * sin + relY * cos;

        const newCx = this.groupCenter.x + newRelX;
        const newCy = this.groupCenter.y + newRelY;

        this.updateElement(id, {
          x: newCx - startState.width / 2,
          y: newCy - startState.height / 2,
          rotation: startState.rotation + angleDiff,
        });
      }
    });
  }

  private checkSnap(x: number, y: number, width: number, height: number, activeId: string): { x: number; y: number } {
    const threshold = this.config.snapThreshold || 5;
    const lines: SnapLine[] = [];
    let newX = x;
    let newY = y;

    const activeEl = this.getElementById(activeId);
    if (!activeEl) return { x, y };

    const tempEl = { ...activeEl, x, y, width, height };
    const bounds = this.getBoundingBox(tempEl);

    const xPoints = [
      { val: bounds.minX, type: "left" },
      { val: bounds.centerX, type: "center" },
      { val: bounds.maxX, type: "right" },
    ];

    const yPoints = [
      { val: bounds.minY, type: "top" },
      { val: bounds.centerY, type: "center" },
      { val: bounds.maxY, type: "bottom" },
    ];

    let snappedX = false;
    let snappedY = false;

    this.elements.forEach((el) => {
      if (el.id === activeId || this.selectedIds.includes(el.id)) return;

      const targetBounds = this.getBoundingBox(el);

      const targetXPoints = [targetBounds.minX, targetBounds.centerX, targetBounds.maxX];
      const targetYPoints = [targetBounds.minY, targetBounds.centerY, targetBounds.maxY];

      if (!snappedX) {
        for (const p of xPoints) {
          for (const tp of targetXPoints) {
            if (Math.abs(p.val - tp) < threshold) {
              const diff = tp - p.val;
              newX += diff;
              snappedX = true;

              let gap = 0;
              if (bounds.maxY < targetBounds.minY) gap = targetBounds.minY - bounds.maxY;
              else if (targetBounds.maxY < bounds.minY) gap = bounds.minY - targetBounds.maxY;

              lines.push({
                type: "vertical",
                position: tp,
                start: Math.min(bounds.minY, targetBounds.minY),
                end: Math.max(bounds.maxY, targetBounds.maxY),
                distance: gap > 0 ? Math.round(gap) : undefined,
              });
              break;
            }
          }
          if (snappedX) break;
        }
      }

      if (!snappedY) {
        for (const p of yPoints) {
          for (const tp of targetYPoints) {
            if (Math.abs(p.val - tp) < threshold) {
              const diff = tp - p.val;
              newY += diff;
              snappedY = true;

              let gap = 0;
              if (bounds.maxX < targetBounds.minX) gap = targetBounds.minX - bounds.maxX;
              else if (targetBounds.maxX < bounds.minX) gap = bounds.minX - targetBounds.maxX;

              lines.push({
                type: "horizontal",
                position: tp,
                start: Math.min(bounds.minX, targetBounds.minX),
                end: Math.max(bounds.maxX, targetBounds.maxX),
                distance: gap > 0 ? Math.round(gap) : undefined,
              });
              break;
            }
          }
          if (snappedY) break;
        }
      }
    });

    this.snapLines = lines;
    this.emit("snapLines", this.snapLines);
    return { x: newX, y: newY };
  }

  private handleResize(dx: number, dy: number, id: string) {
    const startState = this.startElementStates[id];
    if (!startState) return;

    const { x, y, width, height } = startState;
    let newX = x;
    let newY = y;
    let newWidth = width;
    let newHeight = height;

    if (this.activeHandle?.includes("e")) newWidth = width + dx;
    if (this.activeHandle?.includes("w")) {
      newWidth = width - dx;
      newX = x + dx;
    }
    if (this.activeHandle?.includes("s")) newHeight = height + dy;
    if (this.activeHandle?.includes("n")) {
      newHeight = height - dy;
      newY = y + dy;
    }

    if (newWidth < 10) newWidth = 10;
    if (newHeight < 10) newHeight = 10;

    this.updateElement(id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  }

  private handleMouseUp = () => {
    if (this.isSelecting && this.selectionBox) {
      const box = this.selectionBox;
      const selected: string[] = [];

      this.elements.forEach((el) => {
        if (
          el.x < box.x + box.width &&
          el.x + el.width > box.x &&
          el.y < box.y + box.height &&
          el.y + el.height > box.y
        ) {
          selected.push(el.id);
        }
      });

      this.setSelected(selected);

      this.isSelecting = false;
      this.selectionBox = null;
      this.emit("selectionBox", null);
    }

    this.dragging = false;
    this.resizing = false;
    this.rotating = false;
    this.activeHandle = null;
    this.startElementStates = {};
    this.snapLines = [];
    this.emit("snapLines", []);
  };
}
