import { getContext, setContext } from 'svelte';
import type { ImageElementData } from './image.types';
export interface ImageGroupEntry { data: ImageElementData; canPreview: boolean; }
export interface ImageGroupContext {
  register: (id: string, entry: ImageGroupEntry) => () => void;
  preview: (id: string, source: string | undefined) => void;
}
const key = Symbol('ant-image-group');
export function provideImageGroup(context: ImageGroupContext) { setContext(key, context); }
export function useImageGroup(): ImageGroupContext | undefined { return getContext(key); }
