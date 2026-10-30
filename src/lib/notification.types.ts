import type { Snippet } from 'svelte';
import type { createNotification } from './notification.model.svelte.js';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationPlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
export type NotificationKey = string | number;
export type NotificationContent = string | Snippet;

export interface NotificationClosable {
  disabled?: boolean;
  closeIcon?: NotificationContent | false | null;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface NotificationConfig {
  title?: NotificationContent;
  description?: NotificationContent;
  actions?: Snippet;
  icon?: Snippet;
  type?: NotificationType;
  key?: NotificationKey;
  placement?: NotificationPlacement;
  duration?: number | false;
  pauseOnHover?: boolean;
  closable?: boolean | NotificationClosable;
  closeIcon?: NotificationContent | false | null;
  role?: 'alert' | 'status';
  onClose?: () => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}

export interface NotificationOptions {
  placement?: NotificationPlacement;
  duration?: number | false;
  pauseOnHover?: boolean;
  maxCount?: number;
}

export type NotificationInstance = ReturnType<typeof createNotification>;

export interface NotificationHolderProps {
  notification: NotificationInstance;
  top?: number;
  bottom?: number;
  id?: string;
  class?: string;
  style?: string;
}
