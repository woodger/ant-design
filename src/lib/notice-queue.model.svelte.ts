export type NoticeKey = string | number;
/** Вызов закрывает запись; then ожидает завершения либо тихого отсоединения очереди. */
export interface NoticeHandle extends PromiseLike<boolean> {
  (): void;
}
/** Общие параметры записи внутренней очереди Message и Notification. */
export interface NoticeConfig {
  key?: NoticeKey;
  duration?: number;
  pauseOnHover?: boolean;
  onClose?: () => void;
}
export interface NoticeOptions {
  duration?: number;
  maxCount?: number;
  pauseOnHover?: boolean;
}
export type QueueNotice<Config> = Omit<
  Config,
  'onClose'
  | 'duration'
  | 'pauseOnHover'
> & {
  readonly id: number;
  readonly version: number;
  readonly closing: boolean;
};

export const noticeQueueKey = Symbol('ant-notice-queue');

/** Источник времени очереди: schedule принимает миллисекунды и возвращает отмену callback. */
export interface NoticeClock {
  now: () => number;
  schedule: (callback: () => void, milliseconds: number) => () => void;
}

interface Entry<Config> {
  notice: QueueNotice<Config>;
  duration: number;
  remaining: number;
  pauseOnHover: boolean;
  hovered: boolean;
  focused: boolean;
  rendered: boolean;
  started: number;
  timerVersion: number;
  cancel?: () => void;
  onClose?: () => void;
  completion: Promise<boolean>;
  resolve: (closed: boolean) => void;
}

function durationOf(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0
    ? Math.min(value, Number.MAX_SAFE_INTEGER / 1000) * 1000
    : fallback;
}

function noticeHandle(close: () => void, completion: Promise<boolean>): NoticeHandle {
  // bind сохраняет receiver Promise при вызове then через callable handle.
  // oxlint-disable-next-line unicorn/no-thenable -- Публичный API намеренно совмещает close() и await завершения.
  return Object.assign(close, { then: completion.then.bind(completion) });
}

export function createNoticeQueue<Config extends NoticeConfig>(
  options: NoticeOptions,
  connectionError: string,
  defaultDuration = 3
) {
  const defaults = {
    duration: durationOf(options.duration, defaultDuration * 1000),
    pauseOnHover: options.pauseOnHover ?? true,
    maxCount: options.maxCount !== undefined
      && Number.isFinite(options.maxCount)
      && options.maxCount >= 1
      ? Math.floor(options.maxCount)
      : Infinity
  };
  const entries = new Map<number, Entry<Config>>();
  let notices = $state.raw<readonly QueueNotice<Config>[]>([]);
  let visible = $state(false);
  let state: 'fresh' | 'mounted' | 'detached' = 'fresh';
  let clock: NoticeClock | undefined;
  let nextId = 0;

  function publish() {
    notices = [...entries.values()].map((entry) => entry.notice);
  }

  function stop(entry: Entry<Config>) {
    entry.timerVersion++;
    if (entry.cancel) {
      entry.cancel();
      entry.cancel = undefined;
      entry.remaining = Math.max(0, entry.remaining - Math.max(0, clock!.now() - entry.started));
    }
  }

  function arm(entry: Entry<Config>) {
    if (!clock
      || !visible
      || !entry.rendered
      || entry.notice.closing
      || entry.cancel
      || entry.duration === 0
      || (entry.pauseOnHover
        && entry.hovered)
      || entry.focused) return;

    const currentClock = clock;
    const id = entry.notice.id;
    const version = entry.notice.version;
    const timerVersion = ++entry.timerVersion;
    entry.started = currentClock.now();
    // Длинные сроки разбиваются на интервалы, допустимые для browser setTimeout.
    entry.cancel = currentClock.schedule(() => {
      if (entries.get(id) !== entry
        || entry.notice.version !== version
        || entry.timerVersion !== timerVersion
        || entry.notice.closing) return;

      entry.cancel = undefined;
      entry.remaining = Math.max(
        0,
        entry.remaining - Math.max(0, currentClock.now() - entry.started)
      );
      if (entry.remaining > 0)
        arm(entry); else closeEntries([entry]);
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

  function closeEntries(requested: readonly Entry<Config>[]) {
    const closing = requested.filter(
      (entry) => entries.get(entry.notice.id) === entry && !entry.notice.closing
    );
    for (const entry of closing) {
      stop(entry);
      entry.notice = { ...entry.notice, closing: true };
    }
    if (closing.length)
      publish();

    const errors: unknown[] = [];
    for (const entry of closing) {
      if (entries.get(entry.notice.id) !== entry)
        continue;
      const callback = entry.onClose;
      entry.onClose = undefined;
      try {
        callback?.();
      } catch (error) {
        errors.push(error);
      }
      finally {
        if (!entry.rendered)
          complete(entry.notice.id, entry.notice.version);
      }
    }
    if (errors.length) throw errors[0];
  }

  function handle(entry: Entry<Config>): NoticeHandle {
    const id = entry.notice.id;
    const completion = entry.completion;
    return noticeHandle(() => {
      const current = entries.get(id);
      if (current)
        closeEntries([current]);
    }, completion);
  }

  function open(config: Config): NoticeHandle {
    if (state === 'detached') {
      return noticeHandle(() => { }, Promise.resolve(false));
    }

    let entry = config.key !== undefined
      ? [...entries.values()].find(
        (item) => !item.notice.closing && item.notice.key === config.key
      )
      : undefined;
    const { duration: configuredDuration, pauseOnHover, onClose, ...content } = config;
    const duration = durationOf(configuredDuration, defaults.duration);
    if (entry)
      stop(entry);
    else {
      let resolve!: (closed: boolean) => void;
      const completion = new Promise<boolean>((done) => {
        resolve = done;
      });
      entry = {
        notice: { ...content, id: ++nextId, version: 0, closing: false },
        duration,
        remaining: duration,
        pauseOnHover: true,
        hovered: false,
        focused: false,
        rendered: false,
        started: 0,
        timerVersion: 0,
        completion,
        resolve
      };
      entries.set(entry.notice.id, entry);
    }

    entry.notice = {
      ...content,
      id: entry.notice.id,
      version: entry.notice.version + 1,
      closing: false
    };
    entry.duration = duration;
    entry.remaining = duration;
    entry.pauseOnHover = pauseOnHover ?? defaults.pauseOnHover;
    entry.onClose = onClose;
    publish();
    arm(entry);

    const active = [...entries.values()].filter((item) => !item.notice.closing);
    closeEntries(active.slice(0, Math.max(0, active.length - defaults.maxCount)));
    return handle(entry);
  }

  return {
    open,
    destroy(key?: NoticeKey) {
      closeEntries(
        [...entries.values()].filter((entry) => key === undefined || entry.notice.key === key)
      );
    },
    [noticeQueueKey]: {
      get notices() {
        return notices;
      },
      get visible() {
        return visible;
      },
      connect(nextClock: NoticeClock) {
        if (state === 'mounted') throw new Error(connectionError);

        state = 'mounted';
        clock = nextClock;
        let connected = true;
        return () => {
          if (!connected) return;

          connected = false;
          state = 'detached';
          visible = false;
          for (const entry of entries.values()) {
            stop(entry);
            entry.onClose = undefined;
            entry.resolve(false);
          }
          entries.clear();
          clock = undefined;
          publish();
        };
      },
      setVisible(next: boolean) {
        if (visible === next) return;

        visible = next;
        for (const entry of entries.values()) {
          if (next)
            arm(entry); else stop(entry);
        }
      },
      mounted(id: number) {
        const entry = entries.get(id);
        if (entry) {
          entry.rendered = true;
          arm(entry);
        }
      },
      hover(id: number, next: boolean) {
        const entry = entries.get(id);
        if (!entry || entry.notice.closing || entry.hovered === next) return;

        entry.hovered = next;
        if (entry.pauseOnHover && next)
          stop(entry); else arm(entry);
      },
      focus(id: number, next: boolean) {
        const entry = entries.get(id);
        if (!entry || entry.notice.closing || entry.focused === next) return;

        entry.focused = next;
        if (next)
          stop(entry); else arm(entry);
      },
      close(id: number) {
        const entry = entries.get(id);
        if (entry)
          closeEntries([entry]);
      },
      complete
    }
  };
}
