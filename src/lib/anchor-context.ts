import { getContext, setContext } from 'svelte';
import type { AnchorContent, AnchorDirection, AnchorSlots } from './anchor.types';
export interface AnchorContext {
  readonly activeLink: string | null;
  readonly direction: AnchorDirection;
  readonly classNames: AnchorSlots;
  readonly styles: AnchorSlots;
  register(href: string, offset?: number): () => void;
  click(event: MouseEvent, href: string, title?: AnchorContent, offset?: number): void;
}
const key = Symbol('ant-anchor');
export function setAnchor(context: AnchorContext) { setContext(key, context); }
export function useAnchor() { return getContext<AnchorContext | undefined>(key); }
