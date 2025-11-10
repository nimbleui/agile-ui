import {isArray} from './types';

type IterateFun<T, R> = (data: {item: T; level: number; parent?: T}) => R;

interface RecursionOptions<T> {
  level: number;
  children: keyof T | Array<keyof T>;
  iterate?: IterateFun<T, void>;
  findFun?: IterateFun<T, boolean>;
  parents?: T[];
}

function recursion<T>(tree: T, options: RecursionOptions<T>): T | T[] | null {
  const {children, level, iterate, findFun, parents} = options;
  const field = isArray(children) ? children[level] : children;
  const list = tree[field] as any[];
  if (!list?.length) return null;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const param = {item, level: level + 1, parent: tree};
    iterate?.(param);
    const res = findFun?.(param);
    if (res) return parents ? [...parents, item] : item;
    /** 递归 */
    const found = recursion(item, {
      children,
      iterate,
      findFun,
      level: level + 1,
      parents: parents ? [...parents, item] : parents,
    });
    if (found) return found;
  }
  return null;
}

/**
 * 遍历树形数据
 * @param tree 树形数据
 * @param iterate 迭代器
 * @param children 子级的字段
 */
export function eachTree<T extends Record<string, any>>(
  tree: T[],
  iterate: IterateFun<T, void>,
  children: string | string[] = 'children'
) {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    iterate({item, level: 0});
    recursion(item, {level: 0, children, iterate});
  }
}

/**
 * 查找树形数据
 * @param tree 树形数据
 * @param iterate 迭代器
 * @param children 子级的字段
 * @returns
 */
export function findTree<T extends Record<string, any>>(
  tree: T[],
  iterate: IterateFun<T, boolean>,
  children: string | string[] = 'children'
) {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    const res = iterate({item, level: 0});
    if (res) return item;
    const found = recursion<T>(item, {
      level: 0,
      children,
      findFun: iterate,
    }) as T | null;
    if (found) return found;
  }
  return null;
}

/**
 * 找出指定id对应数据所有的父级元素
 * @param tree 树形数据
 * @param iterate 迭代器
 * @param children 子级的字段
 * @returns
 */
export function findAllParents<T extends Record<string, any>>(
  tree: T[],
  iterate: IterateFun<T, boolean>,
  children: string | string[] = 'children'
) {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    const res = iterate({item, level: 0});
    if (res) return [item];
    const found = recursion<T>(item, {
      level: 0,
      children,
      findFun: iterate,
      parents: [item],
    }) as T[] | null;
    if (found) return found;
  }
  return null;
}
