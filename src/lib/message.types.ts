import type { Snippet } from 'svelte';
import type { createMessage } from './message.model.svelte.js';

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';
export type MessageKey = string | number;
export type MessageContent = string | Snippet;

/** Содержимое и жизненный цикл одного сообщения createMessage. */
export interface MessageConfig {
  content: MessageContent;
  type?: MessageType;
  /** Совпадающий key обновляет существующее сообщение. */
  key?: MessageKey;
  /** Время в секундах; 0 отключает автоматическое закрытие. */
  duration?: number;
  pauseOnHover?: boolean;
  icon?: Snippet;
  role?: 'status' | 'alert';
  /** Вызывается при начале закрытия; отсоединение holder не вызывает callback. */
  onClose?: () => void;
  class?: string;
  style?: string;
}

/** Настройки независимой очереди createMessage; значения сообщения имеют приоритет. */
export interface MessageOptions {
  /** Продолжительность по умолчанию в секундах; без настройки — 3. */
  duration?: number;
  /** Лимит очереди; новые записи вытесняют наиболее старые. */
  maxCount?: number;
  pauseOnHover?: boolean;
}

/** Вызов закрывает сообщение; await даёт true после завершения, false при отсоединении holder. */
export interface MessageHandle extends PromiseLike<boolean> {
  (): void;
}

export type MessageInstance = ReturnType<typeof createMessage>;

/** Единственная визуальная поверхность выбранного экземпляра createMessage. */
export interface MessageHolderProps {
  message: MessageInstance;
  /** @defaultValue 8 */
  top?: number | string;
  id?: string;
  class?: string;
  style?: string;
}
