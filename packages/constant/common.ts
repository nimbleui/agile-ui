import type { InjectionKey } from "vue";

export interface CommonContextType {
  emit: (type: string, data: Record<string, any>) => void;
  on: (type: string, fn: (data: Record<string, any>) => void) => void;
  data: Record<string, any>
}

export const commonContextKey: InjectionKey<CommonContextType> = Symbol("commonContextKey");
