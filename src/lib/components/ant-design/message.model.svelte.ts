import { createNoticeQueue, type QueueNotice } from './notice-queue.model.svelte';
import type { MessageConfig, MessageContent, MessageOptions, MessageType } from './message.types';

export { noticeQueueKey as messageHolderKey, type NoticeClock as MessageClock } from './notice-queue.model.svelte';
type ResolvedMessage = MessageConfig & { type: MessageType; role: 'status' | 'alert' };
export type MessageNotice = QueueNotice<ResolvedMessage>;

export function createMessage(options: MessageOptions = {}) {
  const queue = createNoticeQueue<ResolvedMessage>({ ...options, duration: options.duration ?? 3 }, 'A message instance supports one mounted MessageHolder.');
  function open(config: MessageConfig) { return queue.open({ ...config, type: config.type ?? 'info', role: config.role ?? 'status' }); }
  function typed(type: MessageType) {
    return (content: MessageContent | Omit<MessageConfig, 'type'>, duration?: number | (() => void), onClose?: () => void) => {
      const config = typeof content === 'object' ? content : { content };
      return open({ ...config, type, duration: typeof duration === 'number' ? duration : config.duration, onClose: typeof duration === 'function' ? duration : onClose ?? config.onClose });
    };
  }
  return { ...queue, open, info: typed('info'), success: typed('success'), warning: typed('warning'), error: typed('error'), loading: typed('loading') };
}
