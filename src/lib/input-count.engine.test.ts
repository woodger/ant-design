import { describe, expect, it } from 'vitest';
import { inputCountInfo, inputExceedValue, resolveInputClear } from './input-count.engine';

describe('Input count', () => {
  it(
    'counts UTF-16 units by default and keeps the native maximum separate from a soft limit',
    () => {
      expect(inputCountInfo('😀x', undefined, true, 5)).toMatchObject({
        info: { count: 3, maxLength: 5 },
        content: '3 / 5',
        exceeded: false
      });
      expect(inputCountInfo('😀x', { max: 2 }, true, 5)).toMatchObject({
        info: { count: 3, maxLength: 2 },
        content: '3 / 2',
        exceeded: true
      });
    }
  );

  it(
    'lets count.show override showCount and passes custom strategy results to the formatter',
    () => {
      const config = {
        max: 4,
        strategy: (value: string) => [...value].length,
        show: ({ count, maxLength }: { count: number; maxLength?: number; }) =>
          `${count} of ${maxLength}`
      };

      expect(inputCountInfo('😀x', config, false)).toMatchObject({
        info: { count: 2 },
        content: '2 of 4',
        show: true
      });
      expect(inputCountInfo('abc', { show: false }, true)).toMatchObject({
        content: undefined,
        show: false
      });
      expect(inputCountInfo('abc', undefined, {
        formatter: ({ value }) => value.toUpperCase()
      }).content).toBe('ABC');
    }
  );

  it('keeps zero unlimited and tracks soft overflow even when the counter is hidden', () => {
    expect(inputCountInfo('long', { max: 0 }, true, 2)).toMatchObject({
      content: '4',
      exceeded: false
    });
    expect(inputCountInfo('long', { max: 2 }, false)).toMatchObject({
      show: false,
      exceeded: true
    });
  });

  it('clips only with an explicit formatter after composition finishes', () => {
    const config = {
      max: 2,
      strategy: (value: string) => [...value].length,
      exceedFormatter: (value: string, { max }: { max: number; }) =>
        [...value].slice(0, max).join('')
    };

    expect(inputExceedValue('😀abc', { max: 2 }, false)).toBe('😀abc');
    expect(inputExceedValue('😀abc', config, true)).toBe('😀abc');
    expect(inputExceedValue('😀abc', config, false)).toBe('😀a');
    expect(inputExceedValue('😀abc', { ...config, max: 0 }, false)).toBe('😀abc');
  });
});

describe('Input clear configuration', () => {
  it(
    'inherits unprovided icon and disabled fields while respecting explicit local overrides',
    () => {
      const inherited = { disabled: true, clearIcon: 'context' };

      expect(resolveInputClear(undefined, inherited)).toEqual(inherited);
      expect(resolveInputClear(true, inherited)).toEqual(inherited);
      expect(resolveInputClear({ disabled: false, clearIcon: null }, inherited)).toEqual({
        disabled: false,
        clearIcon: null
      });
    }
  );

  it('disables clearing with an explicit false even when the provider enables it', () => {
    expect(resolveInputClear(false, { clearIcon: 'context' })).toBe(false);
    expect(resolveInputClear(undefined, undefined)).toBe(false);
    expect(resolveInputClear(true, false)).toEqual({ clearIcon: undefined, disabled: undefined });
  });
});
