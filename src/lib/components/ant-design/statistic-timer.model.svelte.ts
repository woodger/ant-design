import type { StatisticValue } from './statistic.types';
import type { StatisticTimerType } from './statistic-timer.types';

export interface StatisticTimerRequest { value?: StatisticValue; type: StatisticTimerType; }
export interface StatisticTimerCallbacks { onChange?: (value: number) => void; onFinish?: () => void; }
export interface StatisticTimerClock { now: () => number; repeat: (callback: () => void, milliseconds: number) => () => void; }

export function createStatisticTimerModel(read: () => StatisticTimerRequest, callbacks: () => StatisticTimerCallbacks) {
  let now = $state<number>();
  let current: { active: boolean; cancel?: () => void } | undefined;

  function stop(run: NonNullable<typeof current>) {
    run.active = false;
    run.cancel?.();
    if (current === run) current = undefined;
  }

  return {
    get now() { return now; },
    connect(request: StatisticTimerRequest, clock: StatisticTimerClock) {
      if (current) stop(current);
      const run = { active: true, cancel: undefined as (() => void) | undefined };
      current = run;
      now = clock.now();
      run.cancel = clock.repeat(() => {
        if (!run.active || read() !== request) return;

        const time = clock.now();
        const target = new Date(request.value as StatisticValue).getTime();
        const down = request.type === 'countdown';
        now = time;
        callbacks().onChange?.(down ? target - time : time - target);
        // Callback может изменить цель или удалить компонент до onFinish.
        if (!run.active || read() !== request) return;
        if (down && target < time) {
          stop(run);
          callbacks().onFinish?.();
        }
      }, 1000 / 60);
      return () => stop(run);
    }
  };
}
