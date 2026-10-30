import { getContext, setContext } from 'svelte';
import type { GridGap } from './grid.types';

interface GridRowContext { readonly gutter: [GridGap, GridGap]; readonly wrap: boolean | undefined; }
const rowKey = Symbol('ant-grid-row');
export function provideGridRow(context: GridRowContext) { setContext(rowKey, context); }
export function useGridRow(): GridRowContext | undefined { return getContext(rowKey); }
