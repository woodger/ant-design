import type { MessageConfig, MessageContent, MessageHandle, MessageKey, MessageOptions, MessageType } from './message.types';

export const messageHolderKey = Symbol('ant-message-holder');

export interface MessageNotice extends Omit<MessageConfig, 'onClose' | 'duration' | 'pauseOnHover'> {
  readonly id: number;
  readonly version: number;
  readonly type: MessageType;
  readonly role: 'status' | 'alert';
  readonly closing: boolean;
}

export interface MessageClock {
  now: () => number;
  schedule: (callback: () => void, milliseconds: number) => () => void;
}

interface Entry {
  notice: MessageNotice;
  duration: number;
  remaining: number;
  pauseOnHover: boolean;
  hovered: boolean;
  rendered: boolean;
  started: number;
  timerVersion: number;
  cancel?: () => void;
  onClose?: () => void;
  completion: Promise<boolean>;
  resolve: (closed: boolean) => void;
}

function durationOf(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? Math.min(value, Number.MAX_SAFE_INTEGER / 1000) * 1000 : fallback;
}

function messageHandle(close: () => void, completion: Promise<boolean>): MessageHandle {
  // oxlint-disable-next-line unicorn/no-thenable -- Публичный API намеренно совмещает close() и await завершения.
  return Object.assign(close, { then: completion.then.bind(completion) });
}

export function createMessage(options: MessageOptions = {}) {
  const defaults = { duration: durationOf(options.duration, 3000), pauseOnHover: options.pauseOnHover ?? true, maxCount: options.maxCount !== undefined && Number.isFinite(options.maxCount) && options.maxCount >= 1 ? Math.floor(options.maxCount) : Infinity };
  const entries = new Map<number, Entry>();
  let notices = $state.raw<readonly MessageNotice[]>([]);
  let visible = $state(false);
  let state: 'fresh' | 'mounted' | 'detached' = 'fresh';
  let clock: MessageClock | undefined;
  let nextId = 0;

  function publish() { notices = [...entries.values()].map((entry) => entry.notice); }

  function stop(entry: Entry) {
    entry.timerVersion++;
    if (entry.cancel) {
      entry.cancel();
      entry.cancel = undefined;
      entry.remaining = Math.max(0, entry.remaining - Math.max(0, clock!.now() - entry.started));
    }
  }

  function arm(entry: Entry) {
    if (!clock || !visible || !entry.rendered || entry.notice.closing || entry.cancel || entry.duration === 0 || entry.pauseOnHover && entry.hovered) return;

    const currentClock = clock;
    const id = entry.notice.id;
    const version = entry.notice.version;
    const timerVersion = ++entry.timerVersion;
    entry.started = currentClock.now();
    // Длинные сроки разбиваются на интервалы, допустимые для browser setTimeout.
    entry.cancel = currentClock.schedule(() => {
      if (entries.get(id) !== entry || entry.notice.version !== version || entry.timerVersion !== timerVersion || entry.notice.closing) return;

      entry.cancel = undefined;
      entry.remaining = Math.max(0, entry.remaining - Math.max(0, currentClock.now() - entry.started));
      if (entry.remaining > 0) arm(entry); else closeEntries([entry]);
    }, Math.min(entry.remaining, 2_147_483_647));
  }

  function complete(id: number, version: number) {
    const entry = entries.get(id);
    if (!entry || !entry.notice.closing || entry.notice.version !== version) return;

    stop(entry);
    entries.delete(id);
    publish();
    entry.resolve(true);
  }

  function closeEntries(requested: readonly Entry[]) {
    const closing = requested.filter((entry) => entries.get(entry.notice.id) === entry && !entry.notice.closing);
    for (const entry of closing) { stop(entry); entry.notice = { ...entry.notice, closing: true }; }
    if (closing.length) publish();

    const errors: unknown[] = [];
    for (const entry of closing) {
      if (entries.get(entry.notice.id) !== entry) continue;
      const callback = entry.onClose;
      entry.onClose = undefined;
      try { callback?.(); } catch (error) { errors.push(error); }
      finally { if (!entry.rendered) complete(entry.notice.id, entry.notice.version); }
    }
    if (errors.length) throw errors[0];
  }

  function handle(entry: Entry): MessageHandle {
    const id = entry.notice.id;
    const completion = entry.completion;
    return messageHandle(() => { const current = entries.get(id); if (current) closeEntries([current]); }, completion);
  }

  function open(config: MessageConfig): MessageHandle {
    if (state === 'detached') {
      return messageHandle(() => {}, Promise.resolve(false));
    }

    let entry = config.key !== undefined ? [...entries.values()].find((item) => !item.notice.closing && item.notice.key === config.key) : undefined;
    const duration = durationOf(config.duration, defaults.duration);
    if (entry) stop(entry);
    else {
      let resolve!: (closed: boolean) => void;
      const completion = new Promise<boolean>((done) => { resolve = done; });
      entry = { notice: { content: '', id: ++nextId, version: 0, type: 'info', role: 'status', closing: false }, duration, remaining: duration, pauseOnHover: true, hovered: false, rendered: false, started: 0, timerVersion: 0, completion, resolve };
      entries.set(entry.notice.id, entry);
    }

    entry.notice = { id: entry.notice.id, version: entry.notice.version + 1, content: config.content, type: config.type ?? 'info', key: config.key, role: config.role ?? 'status', icon: config.icon, class: config.class, style: config.style, closing: false };
    entry.duration = duration;
    entry.remaining = duration;
    entry.pauseOnHover = config.pauseOnHover ?? defaults.pauseOnHover;
    entry.onClose = config.onClose;
    publish();
    arm(entry);

    const active = [...entries.values()].filter((item) => !item.notice.closing);
    closeEntries(active.slice(0, Math.max(0, active.length - defaults.maxCount)));
    return handle(entry);
  }

  function typed(type: MessageType) {
    return (content: MessageContent | Omit<MessageConfig, 'type'>, duration?: number | (() => void), onClose?: () => void) => {
      const config = typeof content === 'object' ? content : { content };
      return open({ ...config, type, duration: typeof duration === 'number' ? duration : config.duration, onClose: typeof duration === 'function' ? duration : onClose ?? config.onClose });
    };
  }

  return {
    open,
    info: typed('info'), success: typed('success'), warning: typed('warning'), error: typed('error'), loading: typed('loading'),
    destroy(key?: MessageKey) { closeEntries([...entries.values()].filter((entry) => key === undefined || entry.notice.key === key)); },
    [messageHolderKey]: {
      get notices() { return notices; },
      get visible() { return visible; },
      connect(nextClock: MessageClock) {
        if (state === 'mounted') throw new Error('A message instance supports one mounted MessageHolder.');

        state = 'mounted';
        clock = nextClock;
        let connected = true;
        return () => {
          if (!connected) return;

          connected = false;
          state = 'detached';
          visible = false;
          for (const entry of entries.values()) { stop(entry); entry.onClose = undefined; entry.resolve(false); }
          entries.clear();
          clock = undefined;
          publish();
        };
      },
      setVisible(next: boolean) {
        if (visible === next) return;

        visible = next;
        for (const entry of entries.values()) { if (next) arm(entry); else stop(entry); }
      },
      mounted(id: number) {
        const entry = entries.get(id);
        if (entry) { entry.rendered = true; arm(entry); }
      },
      hover(id: number, next: boolean) {
        const entry = entries.get(id);
        if (!entry || entry.notice.closing || entry.hovered === next) return;

        entry.hovered = next;
        if (entry.pauseOnHover && next) stop(entry); else arm(entry);
      },
      complete
    }
  };
}
