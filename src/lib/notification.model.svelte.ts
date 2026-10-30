import { createNoticeQueue, noticeQueueKey, type QueueNotice } from './notice-queue.model.svelte.js';
import type { NotificationConfig, NotificationOptions, NotificationPlacement, NotificationType } from './notification.types';

export const notificationPlacements: readonly NotificationPlacement[] = ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'];
export { noticeQueueKey as notificationHolderKey } from './notice-queue.model.svelte.js';
type ResolvedNotification = Omit<NotificationConfig, 'duration'> & { duration?: number; placement: NotificationPlacement; role: 'alert' | 'status' };
export type NotificationNotice = QueueNotice<ResolvedNotification>;

export function createNotification(options: NotificationOptions = {}) {
  const placement = notificationPlacements.includes(options.placement!) ? options.placement! : 'topRight';
  const queue = createNoticeQueue<ResolvedNotification>({ ...options, duration: options.duration === false ? 0 : options.duration }, 'A notification instance supports one mounted NotificationHolder.', 4.5);
  function open(config: NotificationConfig): void {
    queue.open({ ...config, duration: config.duration === false ? 0 : config.duration, placement: notificationPlacements.includes(config.placement!) ? config.placement! : placement, role: config.role ?? 'alert' });
  }
  function typed(type: NotificationType) { return (config: Omit<NotificationConfig, 'type'>) => open({ ...config, type }); }
  return { open, success: typed('success'), info: typed('info'), warning: typed('warning'), error: typed('error'), destroy: queue.destroy, [noticeQueueKey]: queue[noticeQueueKey] };
}
