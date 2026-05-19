interface ChangeSite {
  from: number;
  to: number;
}

interface AttrsTypes {
  x?: ChangeSite;
  y?: ChangeSite;
  scale?: ChangeSite;
  opacity?: ChangeSite;
  height?: ChangeSite;
  width?: ChangeSite;
}

export interface ModelProps {
  /** 持续时间（ms） */
  duration?: number;
  /** 显示隐藏 */
  modelValue?: boolean;
  attrs?: AttrsTypes;
}
