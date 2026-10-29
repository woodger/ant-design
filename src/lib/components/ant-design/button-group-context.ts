import { getContext, setContext } from 'svelte';
import type { ComponentSize } from './types';
interface ButtonGroupContext { readonly size?: ComponentSize | 'medium'; }
const key = Symbol('ant-button-group');
export function provideButtonGroup(context: ButtonGroupContext) { setContext(key, context); }
export function useButtonGroup() { return getContext<ButtonGroupContext | undefined>(key); }
