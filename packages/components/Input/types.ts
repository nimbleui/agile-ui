import type { InputHTMLAttributes } from "vue";
import type { CommonTypes } from "../common";

export interface InputProps extends CommonTypes {
  /** 输入框类型 */
  type?: InputHTMLAttributes["type"];
  /** 占位提示 */
  placeholder?: string;
}
