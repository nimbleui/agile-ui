import type { TreeVirtualNode, TreeVirtualProps } from "./types";

type TreeVirtualPropsWithKeys<T> = TreeVirtualProps<T> & Required<Pick<TreeVirtualProps<T>, "idKey" | "childrenKey">>;

/**
 * 将树形结构扁平化为一维数组，方便虚拟列表渲染
 */
export function flattenTree<T extends Record<string, any>>(
  tree: T[],
  props: TreeVirtualPropsWithKeys<T>,
): TreeVirtualNode<T>[] {
  // 扁平化后的结果数组
  const result: TreeVirtualNode<T>[] = [];

  // 递归遍历树结构，将每个节点附加层级和父节点信息后推入 result
  function flatten(tree: T[], level = 0, parentId: string | number | null = null) {
    for (const node of tree) {
      const el = node as TreeVirtualNode<T>;
      // 当前节点所在层级（从 0 开始）
      el.level = level;
      // 当前节点的父节点 id，根节点为 null
      el.parentId = parentId;
      result.push(el);

      // 如果当前节点是展开状态且存在子节点，则递归扁平化子节点
      const child = node[props.childrenKey] as T[];
      if (child && el.expanded) {
        flatten(child, level + 1, node[props.idKey]);
      }
    }
  }

  // 从顶层节点开始递归扁平化
  flatten(tree);

  return result;
}

/**
 * 根据 id 在树结构中深度优先查找对应节点
 */
export function findNodeById<T extends Record<string, any>>(
  tree: T[],
  id: number | string,
  props: TreeVirtualPropsWithKeys<T>,
) {
  const { idKey, childrenKey } = props;

  // 递归在当前层级及其子节点中查找
  function findNode(tree: T[]): T | null {
    for (const node of tree) {
      // 命中目标 id，返回当前节点
      if (node[idKey] === id) return node;
      const child = node[childrenKey];
      // 如果存在子节点，继续在子节点中递归查找
      if (child) {
        const found = findNode(child);
        if (found) return found;
      }
    }
    // 未找到目标节点
    return null;
  }

  return findNode(tree);
}
