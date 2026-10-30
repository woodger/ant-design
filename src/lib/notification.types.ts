import type { Snippet } from 'svelte';
import type { createNotification } from './notification.model.svelte.js';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationPlacement =
  'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';
export type NotificationKey = string | number;
export type NotificationContent = string | Snippet;

export interface NotificationClosable {
  disabled?: boolean;
  closeIcon?: NotificationContent | false | null;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** Содержимое, положение и жизненный цикл одного уведомления. */
export interface NotificationConfig {
  title?: NotificationContent;
  description?: NotificationContent;
  actions?: Snippet;
  icon?: Snippet;
  type?: NotificationType;
  /** Совпадающий key обновляет уведомление, сохраняя его место в очереди. */
  key?: NotificationKey;
  placement?: NotificationPlacement;
  /** Время в секундах; 0 или false отключает автоматическое закрытие. */
  duration?: number | false;
  pauseOnHover?: boolean;
  closable?: boolean | NotificationClosable;
  closeIcon?: NotificationContent | false | null;
  role?: 'alert' | 'status';
  /** Вызывается при начале закрытия; отсоединение holder не вызывает callback. */
  onClose?: () => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}

/** Настройки очереди createNotification; локальная конфигурация уведомления имеет приоритет. */
export interface NotificationOptions {
  placement?: NotificationPlacement;
  /** Продолжительность по умолчанию в секундах; без настройки — 4.5. */
  duration?: number | false;
  pauseOnHover?: boolean;
  /** Общий лимит для всех placements. */
  maxCount?: number;
}

export type NotificationInstance = ReturnType<typeof createNotification>;

/** Единственная поверхность экземпляра createNotification для всех placements. */
export interface NotificationHolderProps {
  notification: NotificationInstance;
  /** @defaultValue 24 */
  top?: number;
  /** @defaultValue 24 */
  bottom?: number;
  id?: string;
  class?: string;
  style?: string;
}
