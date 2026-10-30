import { describe, expect, it } from 'vitest';
import { displaySteps } from './steps-display.engine';
import type { StepsStatus } from './steps.types';

describe('Steps collapsed display', () => {
  const items = Array.from({ length: 10 }, (_, index) => ({ key: `step-${index}` }));
  it('keeps every item for omitted, small or unnecessary maxCount without mutating input', () => {
    const frozen = Object.freeze(items.map(item => Object.freeze({ ...item })));
    for (const count of [undefined, 0, 2, 10, 20]) {
      const result = displaySteps(frozen, 4, 0, count);
      expect(result.collapsed).toBe(false);
      expect(result.steps.map(step => step.originIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(result.current).toBe(4);
    }
  });
  it('keeps first, last and current, with disabled ellipses outside the real-item count', () => {
    const result = displaySteps(items, 4, 0, 3);
    expect(result.steps.map(step => step.originIndex)).toEqual([0, -1, 4, -1, 9]);
    expect(result.current).toBe(2);
    expect(result.steps.filter(step => !step.item).map(step => step.status)).toEqual(['finish', 'wait']);
  });
  it('fills neighbors in source priority and maps initial offsets to original callback indexes', () => {
    const result = displaySteps(items, 14, 10, 5);
    expect(result.steps.map(step => step.originIndex)).toEqual([0, -1, 3, 4, 5, -1, 9]);
    expect(result.steps[result.current].originIndex + 10).toBe(14);
    expect(displaySteps(items, 0, 0, 4).steps.map(step => step.originIndex)).toEqual([0, 1, -1, 8, 9]);
  });
  it('communicates hidden error status and keeps explicit and generated keys separate', () => {
    const source = items.map((item, index) => ({ ...item, status: index === 2 ? 'error' as StepsStatus : undefined }));
    const result = displaySteps(source, 4, 0, 3);
    expect(result.steps[1].status).toBe('error');
    expect(result.steps[3].status).toBe('wait');
    expect(new Set(result.steps.map(step => step.key)).size).toBe(result.steps.length);
  });
  it('clamps only the visible window for out-of-range current without inventing an active item', () => {
    const before = displaySteps(items, -5, 0, 3);
    expect(before.current).toBe(-5);
    expect(before.steps.map(step => step.originIndex)).toEqual([0, 1, -1, 9]);
    const after = displaySteps(items, 20, 0, 3);
    expect(after.current).toBe(20);
    expect(after.steps.map(step => step.originIndex)).toEqual([0, -1, 8, 9]);
  });
});
