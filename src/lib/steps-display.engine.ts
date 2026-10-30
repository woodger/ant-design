import type { StepsStatus } from './steps.types';

export interface DisplayableStep {
  key?: string | number;
  originalKey?: string | number;
  status?: StepsStatus;
}
export interface DisplayedStep<T> {
  item?: T;
  originIndex: number;
  key: string;
  sourceKey?: string;
  status?: StepsStatus;
}

// По Ant Design 6.6.8 useDisplaySteps: maxCount считает шаги, исключая многоточия.
export function displaySteps<T extends DisplayableStep>(
  items: readonly T[],
  current: number,
  initial = 0,
  maxCount?: number
) {
  const sourceKey = (index: number) => 'originalKey' in items[index]
    ? items[index].originalKey ?? index
    : items[index].key ?? index;
  const mappedCurrent = current - initial;
  const collapsed = maxCount !== undefined && maxCount >= 3 && items.length > maxCount;
  let indexes = items.map((_, index) => index);
  if (collapsed) {
    const safeCurrent = Math.min(Math.max(mappedCurrent, 0), items.length - 1);
    const chosen = new Set([0, safeCurrent, items.length - 1]);
    for (let distance = 1; chosen.size < maxCount && distance < items.length; distance++) {
      for (const index of [
        safeCurrent - distance,
        safeCurrent + distance,
        distance,
        items.length - 1 - distance
      ]) {
        if (chosen.size >= maxCount)
          break;
        if (index >= 0 && index < items.length)
          chosen.add(index);
      }
    }
    indexes = [...chosen].sort((a, b) => a - b);
  }
  const steps: DisplayedStep<T>[] = [];
  for (const [order, index] of indexes.entries()) {
    const previous = indexes[order - 1];
    if (collapsed && order > 0 && index - previous > 1) {
      const hidden = items.slice(previous + 1, index);
      steps.push(
        {
          originIndex: -1,
          sourceKey: `ellipsis-${sourceKey(previous)}-${sourceKey(index)}`,
          key: `ellipsis:${items[previous].key ?? previous}:${items[index].key ?? index}`,
          status: hidden.some(item => item.status === 'error')
            ? 'error'
            : index - 1 < mappedCurrent ? 'finish' : 'wait'
        }
      );
    }
    const item = items[index];
    steps.push({ item, originIndex: index, key: `item:${item.key ?? index}` });
  }
  const displayCurrent = steps.findIndex(step => step.originIndex === mappedCurrent);
  return { collapsed, steps, current: displayCurrent >= 0 ? displayCurrent : mappedCurrent };
}
