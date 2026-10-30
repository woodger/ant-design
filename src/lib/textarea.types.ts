import type { HTMLTextareaAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export interface TextAreaProps extends Omit<HTMLTextareaAttributes, 'value' | 'defaultValue' | 'children' | 'class'> {
  value?: string;
  defaultValue?: string;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  onValueChange?: (value: string) => void;
  onPressEnter?: HTMLTextareaAttributes['onkeydown'];
  nativeElement?: HTMLTextAreaElement;
  class?: string;
}
