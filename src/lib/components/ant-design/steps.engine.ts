import type { StepsItem, StepsStatus } from './steps.types';

export function normalizeStepsItems(items: readonly StepsItem[]): StepsItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.key)) return false;

    seen.add(item.key);
    return true;
  });
}

export function normalizeStepsCurrent(current: number, count: number): number {
  return Math.min(count, Math.max(0, Number.isFinite(current) ? Math.trunc(current) : 0));
}

export function getStepsStatus<T extends { key: string; status?: StepsStatus }>(item: T, index: number, current: number, status: StepsStatus): StepsStatus {
  return item.status ?? (index < current ? 'finish' : index === current ? status : 'wait');
}
