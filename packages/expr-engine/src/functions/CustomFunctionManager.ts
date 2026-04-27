import { FunctionRegistry } from "../runtime/FunctionRegistry";
import { IFunction } from "../runtime/FunctionRegistry";
import { CustomFunctionDef } from "./CustomFunctionDef";
import { CustomFunctionCompiler } from "./CustomFunctionCompiler";
import { Sandbox } from "../security/Sandbox";

/**
 * 自定义函数管理器
 * - 管理页面/应用级别的自定义函数生命周期（注册、更新、注销）。
 * - 通过 CustomFunctionCompiler 将配置编译为可执行函数。
 * - 维护一个以函数 ID 为键的已编译函数缓存，避免同一 ID 重复编译。
 */
export class CustomFunctionManager {
  private registry: FunctionRegistry; // 目标注册表（页面级、应用级或全局）
  private compiler: CustomFunctionCompiler; // 编译器（依赖沙箱）
  private compiledFunctions: Map<string, IFunction> = new Map(); // ID → 已编译函数

  /**
   * @param registry  函数注册表（用于将编译后的函数注册进去）
   * @param sandbox   沙箱实例（用于函数体的安全校验与执行）
   */
  constructor(registry: FunctionRegistry, sandbox: Sandbox) {
    this.registry = registry;
    this.compiler = new CustomFunctionCompiler(sandbox);
  }

  /**
   * 批量注册自定义函数
   * @param defs  函数定义数组
   */
  registerAll(defs: CustomFunctionDef[]): void {
    for (const def of defs) {
      this.registerOne(def);
    }
  }

  /**
   * 注册单个自定义函数
   * 如果同 ID 已存在，将先注销旧版本再注册新版本（相当于覆盖更新）。
   * @param def  函数定义
   */
  registerOne(def: CustomFunctionDef): void {
    // 编译函数定义 → 可执行函数
    const fn = this.compiler.compile(def);

    // 注册到目标注册表（允许覆盖同名函数）
    this.registry.register(fn, { overwrite: true });

    // 缓存编译结果，用于后续注销或更新
    this.compiledFunctions.set(def.id, fn);
  }

  /**
   * 根据 ID 注销一个自定义函数
   * @param id  函数定义的 ID
   * @returns 是否成功注销
   */
  unregisterById(id: string): boolean {
    const fn = this.compiledFunctions.get(id);
    if (!fn) return false;

    // 从注册表中移除
    this.registry.remove(fn.name);
    // 从缓存中移除
    this.compiledFunctions.delete(id);
    return true;
  }

  /**
   * 更新自定义函数（ID 不变，定义改变）
   * @param def  新的函数定义（使用原有 ID）
   */
  update(def: CustomFunctionDef): void {
    // 先清理旧版本
    this.unregisterById(def.id);
    // 注册新版本
    this.registerOne(def);
  }

  /**
   * 获取所有已编译的自定义函数（主要用于调试/监控）
   */
  getCompiledFunctions(): IFunction[] {
    return Array.from(this.compiledFunctions.values());
  }

  /**
   * 清空所有由管理器注册的自定义函数
   */
  clear(): void {
    for (const [, fn] of this.compiledFunctions) {
      this.registry.remove(fn.name);
    }
    this.compiledFunctions.clear();
  }
}
