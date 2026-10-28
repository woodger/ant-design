import { describe, expect, it, vi } from 'vitest';
import { createStatisticTimerModel, type StatisticTimerRequest } from './statistic-timer.model.svelte';
import { formatStatisticTime } from './statistic-timer.engine';

function clock() {
  let time = 0;
  const jobs: { callback: () => void; cancelled: boolean }[] = [];
  return {
    now: () => time,
    set: (value: number) => { time = value; },
    jobs,
    repeat(callback: () => void, milliseconds: number) {
      expect(milliseconds).toBe(1000 / 60);
      const job = { callback, cancelled: false };
      jobs.push(job);
      return () => { job.cancelled = true; };
    }
  };
}

describe('formatStatisticTime', () => {
  it.each([
    ['H:m:s', '59:28:9'], ['HH:mm:ss', '59:28:09'],
    ['HH:mm:ss:SSS', '59:28:09:003'], ['DD-HH:mm:ss', '02-11:28:09'],
    ['D [Day] H [Hours]', '2 Day 11 Hours'], ['', '']
  ])('formats upstream duration tokens %s', (format, expected) => {
    expect(formatStatisticTime(((2 * 24 + 11) * 60 * 60 + 28 * 60 + 9) * 1000 + 3, format)).toBe(expected);
  });
  it('uses fixed 365-day years and 30-day months rather than calendar arithmetic', () => {
    expect(formatStatisticTime((365 + 30 + 2) * 86400000, 'Y M D')).toBe('1 1 2');
  });
});

describe('Statistic timer lifecycle', () => {
  it('keeps SSR idle and reports signed differences before finishing once strictly after the deadline', () => {
    const source = clock();
    const request: StatisticTimerRequest = { type: 'countdown', value: 1000 };
    const onChange = vi.fn(); const onFinish = vi.fn();
    const model = createStatisticTimerModel(() => request, () => ({ onChange, onFinish }));
    expect(model.now).toBeUndefined();
    model.connect(request, source);
    expect(onChange).not.toHaveBeenCalled();
    source.set(1000); source.jobs[0].callback();
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(onFinish).not.toHaveBeenCalled();
    source.set(1001); source.jobs[0].callback(); source.jobs[0].callback();
    expect(onChange).toHaveBeenLastCalledWith(-1);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(source.jobs[0].cancelled).toBe(true);
  });
  it('restarts on a new target and ignores callbacks from a cancelled or stale interval', () => {
    const source = clock(); let request: StatisticTimerRequest = { type: 'countdown', value: 1000 };
    const onChange = vi.fn(); const onFinish = vi.fn();
    const model = createStatisticTimerModel(() => request, () => ({ onChange, onFinish }));
    model.connect(request, source);
    request = { type: 'countup', value: 0 };
    source.set(2000); source.jobs[0].callback();
    expect(onChange).not.toHaveBeenCalled();
    const disconnect = model.connect(request, source);
    source.jobs[0].callback(); source.jobs[1].callback();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(2000);
    expect(onFinish).not.toHaveBeenCalled();
    disconnect(); source.jobs[1].callback();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(source.jobs.every(job => job.cancelled)).toBe(true);
  });
  it('uses current callbacks and does not finish an old target changed by onChange', () => {
    const source = clock(); let request: StatisticTimerRequest = { type: 'countdown', value: 0 };
    const onFinish = vi.fn(); let onChange = vi.fn();
    const model = createStatisticTimerModel(() => request, () => ({ onChange, onFinish }));
    model.connect(request, source);
    onChange = vi.fn(() => { request = { type: 'countdown', value: 5000 }; });
    source.set(100); source.jobs[0].callback();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(-100);
    expect(onFinish).not.toHaveBeenCalled();
  });
});
