import { CanvasElement, Point, HandleType, TransformState } from "../../types";
import { getCenter, rotatePoint, getAngle, getDistance, radToDeg, degToRad } from "../../utils/geometry";

// 变换控制器类，负责处理拖拽、缩放、旋转的逻辑
export class TransformController {
  // 内部状态
  private state: TransformState = {
    isDragging: false,
    isResizing: false,
    isRotating: false,
    startPoint: { x: 0, y: 0 },
    startElement: null,
    handleType: null,
  };

  // 开始拖拽
  startDrag(element: CanvasElement, point: Point) {
    this.state = {
      isDragging: true,
      isResizing: false,
      isRotating: false,
      startPoint: { ...point },
      startElement: { ...element },
      handleType: null,
    };
  }

  // 开始缩放
  startResize(element: CanvasElement, point: Point, handle: HandleType) {
    this.state = {
      isDragging: false,
      isResizing: true,
      isRotating: false,
      startPoint: { ...point },
      startElement: { ...element },
      handleType: handle,
    };
  }

  // 开始旋转
  startRotate(element: CanvasElement, point: Point) {
    this.state = {
      isDragging: false,
      isResizing: false,
      isRotating: true,
      startPoint: { ...point },
      startElement: { ...element },
      handleType: "rotate",
    };
  }

  // 处理拖拽过程
  handleDrag(currentPoint: Point): Partial<CanvasElement> | null {
    if (!this.state.isDragging || !this.state.startElement) return null;

    const dx = currentPoint.x - this.state.startPoint.x;
    const dy = currentPoint.y - this.state.startPoint.y;

    return {
      x: this.state.startElement.x + dx,
      y: this.state.startElement.y + dy,
    };
  }

  // 处理旋转过程
  handleRotate(currentPoint: Point): Partial<CanvasElement> | null {
    if (!this.state.isRotating || !this.state.startElement) return null;

    const center = getCenter(this.state.startElement);
    const startAngle = getAngle(center, this.state.startPoint);
    const currentAngle = getAngle(center, currentPoint);
    const angleDiff = currentAngle - startAngle;

    return {
      rotation: (this.state.startElement.rotation + angleDiff) % 360,
    };
  }

  // 处理缩放过程
  handleResize(currentPoint: Point, maintainAspectRatio = false): Partial<CanvasElement> | null {
    if (!this.state.isResizing || !this.state.startElement || !this.state.handleType) return null;

    const el = this.state.startElement;
    const center = getCenter(el);
    // 将当前鼠标位置和起始位置旋转回未旋转的坐标系中计算
    const currentPos = rotatePoint(currentPoint, center, -el.rotation);
    const startPos = rotatePoint(this.state.startPoint, center, -el.rotation);

    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;

    let newX = el.x;
    let newY = el.y;
    let newWidth = el.width;
    let newHeight = el.height;

    const handle = this.state.handleType;

    // 根据手柄类型调整尺寸和位置
    if (handle.includes("e")) newWidth += dx;
    if (handle.includes("w")) {
      newX += dx;
      newWidth -= dx;
    }
    if (handle.includes("s")) newHeight += dy;
    if (handle.includes("n")) {
      newY += dy;
      newHeight -= dy;
    }

    // 最小尺寸限制
    if (newWidth < 10) newWidth = 10;
    if (newHeight < 10) newHeight = 10;

    // 重新计算缩放后的中心点（未旋转坐标系）
    const newCenter = {
      x: newX + newWidth / 2,
      y: newY + newHeight / 2,
    };

    // 将新中心点旋转回原始旋转角度，以找到实际的 x/y
    const rotatedCenter = rotatePoint(newCenter, center, el.rotation);

    return {
      x: rotatedCenter.x - newWidth / 2,
      y: rotatedCenter.y - newHeight / 2,
      width: newWidth,
      height: newHeight,
    };
  }

  // 结束变换
  endTransform() {
    this.state = {
      isDragging: false,
      isResizing: false,
      isRotating: false,
      startPoint: { x: 0, y: 0 },
      startElement: null,
      handleType: null,
    };
  }

  // 获取当前是否正在变换
  get isTransforming() {
    return this.state.isDragging || this.state.isResizing || this.state.isRotating;
  }
}
