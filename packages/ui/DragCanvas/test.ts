import { CanvasElement, CanvasConfig, Point, HandleType, SnapGuide } from "../../types";
import { EventBus } from "../utils/eventBus";
import { TransformController } from "./handlers/TransformController";
import { checkCollision, getRotatedCorners, getCenter } from "../utils/geometry";

// 画布核心类，管理所有元素、状态和交互逻辑
export class CanvasCore {
  public elements: CanvasElement[] = []; // 画布上的所有元素
  public config: CanvasConfig; // 画布配置
  public eventBus: EventBus; // 事件总线
  private transformController: TransformController; // 变换控制器
  private selectedElementIds: string[] = []; // 当前选中的元素ID列表
  public activeGuides: SnapGuide[] = []; // 当前激活的辅助线

  constructor(config: CanvasConfig) {
    // 初始化配置，设置默认值
    this.config = {
      gridSize: 10,
      snapToGrid: false,
      showGuides: true,
      snapThreshold: 5,
      zoom: 1,
      ...config,
    };
    this.eventBus = new EventBus();
    this.transformController = new TransformController();
  }

  // 添加元素
  addElement(element: CanvasElement) {
    this.elements.push(element);
    this.eventBus.emit("element:added", element);
    this.eventBus.emit("change", this.elements);
  }

  // 移除元素
  removeElement(id: string) {
    this.elements = this.elements.filter((el) => el.id !== id);
    // 如果移除的元素是选中状态，则清除选中
    if (this.selectedElementIds.includes(id)) {
      this.selectedElementIds = this.selectedElementIds.filter((sid) => sid !== id);
      this.eventBus.emit("selection:changed", this.selectedElementIds);
    }
    this.eventBus.emit("element:removed", id);
    this.eventBus.emit("change", this.elements);
  }

  // 更新元素属性
  updateElement(id: string, updates: Partial<CanvasElement>) {
    const index = this.elements.findIndex((el) => el.id === id);
    if (index !== -1) {
      this.elements[index] = { ...this.elements[index], ...updates };
      this.eventBus.emit("element:updated", this.elements[index]);
      this.eventBus.emit("change", this.elements);
    }
  }

  // 选中元素
  selectElement(id: string | null, multi: boolean = false) {
    if (id === null) {
      this.selectedElementIds = [];
    } else {
      if (multi) {
        // 多选模式：切换选中状态
        if (this.selectedElementIds.includes(id)) {
          this.selectedElementIds = this.selectedElementIds.filter((sid) => sid !== id);
        } else {
          this.selectedElementIds.push(id);
        }
      } else {
        // 单选模式：直接替换
        this.selectedElementIds = [id];
      }
    }

    // 更新所有元素的选中状态标记
    this.elements = this.elements.map((el) => ({
      ...el,
      selected: this.selectedElementIds.includes(el.id),
    }));
    this.eventBus.emit("selection:changed", this.selectedElementIds);
    this.eventBus.emit("change", this.elements);
  }

  // 获取单个元素
  getElement(id: string) {
    return this.elements.find((el) => el.id === id);
  }

  // 获取所有选中的元素
  getSelectedElements() {
    return this.elements.filter((el) => this.selectedElementIds.includes(el.id));
  }

  // 处理鼠标按下事件
  handleMouseDown(point: Point, targetId?: string, handle?: HandleType, shiftKey: boolean = false) {
    // 如果点击的是控制手柄且当前有选中元素
    if (handle && this.selectedElementIds.length === 1) {
      const el = this.getElement(this.selectedElementIds[0]);
      if (el) {
        if (handle === "rotate") {
          this.transformController.startRotate(el, point);
        } else {
          this.transformController.startResize(el, point, handle);
        }
      }
    } else if (targetId) {
      // 如果点击的是元素
      const el = this.getElement(targetId);
      if (el) {
        // 处理选中逻辑
        if (!this.selectedElementIds.includes(targetId) && !shiftKey) {
          this.selectElement(targetId, false);
        } else if (shiftKey) {
          this.selectElement(targetId, true);
        }

        // 目前仅支持单选拖拽（后续可扩展群组拖拽）
        if (this.selectedElementIds.length === 1) {
          this.transformController.startDrag(el, point);
        }
      }
    } else {
      // 点击空白处，取消选中
      this.selectElement(null);
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(point: Point) {
    if (!this.transformController.isTransforming || this.selectedElementIds.length === 0) return;

    let updates: Partial<CanvasElement> | null = null;
    this.activeGuides = [];

    // 访问私有状态进行检查
    if (this.transformController.state.isDragging) {
      updates = this.transformController.handleDrag(point);
      // 应用网格吸附
      if (updates && this.config.snapToGrid) {
        updates = this.applyGridSnap(updates);
      }
      // 应用智能辅助线
      if (updates && this.config.showGuides) {
        updates = this.applySmartGuides(updates);
      }
    } else if (this.transformController.state.isResizing) {
      updates = this.transformController.handleResize(point);
      if (updates && this.config.snapToGrid) {
        updates = this.applyGridSnap(updates);
      }
    } else if (this.transformController.state.isRotating) {
      updates = this.transformController.handleRotate(point);
    }

    if (updates && this.selectedElementIds.length === 1) {
      const targetId = this.selectedElementIds[0];

      // 碰撞检测
      const potentialNewState = { ...this.getElement(targetId)!, ...updates };
      const hasCollision = this.elements.some((el) => {
        if (el.id === targetId) return false;
        return checkCollision(potentialNewState, el);
      });

      this.eventBus.emit("collision", hasCollision);

      this.updateElement(targetId, updates);
      this.eventBus.emit("guides:updated", this.activeGuides);
    }
  }

  // 处理鼠标松开事件
  handleMouseUp() {
    if (this.transformController.isTransforming) {
      this.transformController.endTransform();
      this.activeGuides = [];
      this.eventBus.emit("guides:updated", this.activeGuides);
      this.eventBus.emit("transform:end");
    }
  }

  // 设置缩放比例
  setZoom(zoom: number) {
    this.config.zoom = zoom;
    this.eventBus.emit("zoom:changed", zoom);
  }

  // 应用网格吸附逻辑
  private applyGridSnap(updates: Partial<CanvasElement>): Partial<CanvasElement> {
    const gridSize = this.config.gridSize || 10;
    const snapped = { ...updates };

    if (snapped.x !== undefined) {
      snapped.x = Math.round(snapped.x / gridSize) * gridSize;
    }
    if (snapped.y !== undefined) {
      snapped.y = Math.round(snapped.y / gridSize) * gridSize;
    }
    if (snapped.width !== undefined) {
      snapped.width = Math.round(snapped.width / gridSize) * gridSize;
    }
    if (snapped.height !== undefined) {
      snapped.height = Math.round(snapped.height / gridSize) * gridSize;
    }

    return snapped;
  }

  // 应用智能辅助线逻辑
  private applySmartGuides(updates: Partial<CanvasElement>): Partial<CanvasElement> {
    const threshold = this.config.snapThreshold || 5;
    const current = { ...this.getSelectedElements()[0], ...updates };
    const snapped = { ...updates };
    const guides: SnapGuide[] = [];

    // 获取当前元素（潜在新位置）的旋转角点和中心点
    const currentCorners = getRotatedCorners(current);
    const currentCenter = getCenter(current);
    const currentPoints = [...currentCorners, currentCenter];

    // 遍历其他元素进行对齐检查
    this.elements.forEach((other) => {
      if (this.selectedElementIds.includes(other.id)) return;

      // 获取目标元素的旋转角点和中心点
      const otherCorners = getRotatedCorners(other);
      const otherCenter = getCenter(other);
      const otherPoints = [...otherCorners, otherCenter];

      // 寻找最佳吸附匹配
      // 遍历当前元素的所有关键点
      for (const p1 of currentPoints) {
        // 遍历目标元素的所有关键点
        for (const p2 of otherPoints) {
          // 垂直吸附 (X轴对齐)
          if (Math.abs(p1.x - p2.x) < threshold) {
            // 计算吸附所需的偏移量
            const deltaX = p2.x - p1.x;
            snapped.x = (snapped.x || current.x) + deltaX;
            guides.push({ type: "vertical", position: p2.x });
          }

          // 水平吸附 (Y轴对齐)
          if (Math.abs(p1.y - p2.y) < threshold) {
            // 计算吸附所需的偏移量
            const deltaY = p2.y - p1.y;
            snapped.y = (snapped.y || current.y) + deltaY;
            guides.push({ type: "horizontal", position: p2.y });
          }
        }
      }
    });

    // 去重辅助线
    const uniqueGuides = guides.filter(
      (g, index, self) => index === self.findIndex((t) => t.type === g.type && Math.abs(t.position - g.position) < 0.1),
    );

    this.activeGuides = uniqueGuides;
    return snapped;
  }
}
