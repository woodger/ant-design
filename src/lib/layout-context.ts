import { getContext, setContext } from 'svelte';

interface LayoutContext {
  register: (id: string) => () => void;
}
interface SiderContext {
  readonly collapsed: boolean;
}
const layoutKey = Symbol('ant-layout');
const siderKey = Symbol('ant-layout-sider');
export function provideLayout(context: LayoutContext) {
  setContext(layoutKey, context);
}
export function useLayout(): LayoutContext | undefined {
  return getContext(layoutKey);
}
export function provideSider(context: SiderContext) {
  setContext(siderKey, context);
}
export function useSider(): SiderContext | undefined {
  return getContext(siderKey);
}
