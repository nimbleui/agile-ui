import { CanvasPlugin, PluginCleanup } from "./functions/types";
import { CanvasElement, CanvasConfig, Point, HandleType, SnapGuide } from "../types";
import { EventBus } from "../utils/eventBus";

// 画布核心类，管理所有元素、状态和交互逻辑
export class CanvasCore {
  public elements: CanvasElement[] = []; // 画布上的所有元素
  public config: CanvasConfig; // 画布配置
  public eventBus: EventBus; // 事件总线
  private selectedElementIds: string[] = []; // 当前选中的元素ID列表
  public activeGuides: SnapGuide[] = []; // 当前激活的辅助线
  private pluginCleanups: PluginCleanup[] = []; // 插件清理函数列表

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
  }

  // 注册插件 (函数式)
  use(plugin: CanvasPlugin) {
    const cleanup = plugin(this);
    this.pluginCleanups.push(cleanup);
  }

  // 销毁所有插件
  destroy() {
    this.pluginCleanups.forEach((cleanup) => cleanup());
    this.pluginCleanups = [];
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

  // 处理鼠标按下事件 - 委托给事件总线
  handleMouseDown(point: Point, targetId?: string, handle?: HandleType, shiftKey: boolean = false) {
    // 核心只负责选中逻辑，拖拽/缩放/旋转逻辑由插件接管
    if (targetId && !handle) {
      if (!this.selectedElementIds.includes(targetId) && !shiftKey) {
        this.selectElement(targetId, false);
      } else if (shiftKey) {
        this.selectElement(targetId, true);
      }
    } else if (!targetId) {
      this.selectElement(null);
    }

    this.eventBus.emit("input:down", { point, targetId, handle, shiftKey });
  }

  // 处理鼠标移动事件 - 委托给事件总线
  handleMouseMove(point: Point) {
    this.eventBus.emit("input:move", point);
  }

  // 处理鼠标松开事件 - 委托给事件总线
  handleMouseUp() {
    this.eventBus.emit("input:up");
  }

  // 设置缩放比例
  setZoom(zoom: number) {
    this.config.zoom = zoom;
    this.eventBus.emit("zoom:changed", zoom);
  }
}
