import type { Snippet } from 'svelte';
import type { createMessage } from './message.model.svelte';

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';
export type MessageKey = string | number;
export type MessageContent = string | Snippet;

export interface MessageConfig {
  content: MessageContent;
  type?: MessageType;
  key?: MessageKey;
  duration?: number;
  pauseOnHover?: boolean;
  icon?: Snippet;
  role?: 'status' | 'alert';
  onClose?: () => void;
  class?: string;
  style?: string;
}

export interface MessageOptions {
  duration?: number;
  maxCount?: number;
  pauseOnHover?: boolean;
}

export interface MessageHandle extends PromiseLike<boolean> {
  (): void;
}

export type MessageInstance = ReturnType<typeof createMessage>;

export interface MessageHolderProps {
  message: MessageInstance;
  top?: number | string;
  id?: string;
  class?: string;
  style?: string;
}
