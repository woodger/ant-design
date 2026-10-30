import { describe, expect, it } from 'vitest';
import { getStepsStatus, normalizeStepsCurrent, normalizeStepsItems } from './steps.engine';

describe('Steps state', () => {
  it('keeps the first occurrence of each stable key without mutating owner items', () => {
    const items = [{ key: 'a', title: 'First' }, { key: '', title: 'Empty key' }, { key: 'a', title: 'Duplicate' }, { key: 'b', title: 'Last' }];
    expect(normalizeStepsItems(items)).toEqual([items[0], items[1], items[3]]); expect(items).toHaveLength(4);
  });
  it.each([[NaN, 0], [Infinity, 0], [-Infinity, 0], [-4, 0], [1.9, 1], [2, 2], [3, 3], [99, 3]])('normalizes current %s to %s while allowing all steps to finish', (value, expected) => {
    expect(normalizeStepsCurrent(value, 3)).toBe(expected);
  });
  it('keeps an empty list without an active item', () => { expect(normalizeStepsItems([])).toEqual([]); expect(normalizeStepsCurrent(8, 0)).toBe(0); });
  it('computes prior, current and later statuses independently of click availability', () => {
    const item = { key: 'step', title: 'Step', disabled: true };
    expect([0, 1, 2].map(index => getStepsStatus(item, index, 1, 'error'))).toEqual(['finish', 'error', 'wait']);
    expect(getStepsStatus(item, 1, 1, 'wait')).toBe('wait'); expect(getStepsStatus(item, 1, 1, 'finish')).toBe('finish');
  });
  it('preserves explicit per-item status over automatic and current statuses', () => {
    for (const status of ['wait', 'process', 'finish', 'error'] as const) for (const index of [0, 1, 2]) expect(getStepsStatus({ key: 'custom', title: 'Custom', status }, index, 1, 'error')).toBe(status);
  });
  it('finishes every automatic item when current equals the item count', () => {
    expect([0, 1, 2].map(index => getStepsStatus({ key: String(index), title: 'Step' }, index, 3, 'process'))).toEqual(['finish', 'finish', 'finish']);
  });
});
