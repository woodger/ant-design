import { describe, expect, it } from 'vitest';
import {
  resolveTextAreaClear,
  resolveTextAreaCount,
  textAreaCountInfo,
  textAreaExceedValue,
  textAreaResizeStyle
} from './textarea.engine';

describe('TextArea count', () => {
  it('counts UTF-16 units by default and lets count.show override showCount', () => {
    expect(textAreaCountInfo('😀x', undefined, true, 5)).toMatchObject(
      { content: '3 / 5', exceeded: false, show: true }
    );
    expect(textAreaCountInfo('abc', { show: false }, true, 2)).toMatchObject(
      { show: false, content: undefined, exceeded: true }
    );
    expect(resolveTextAreaCount({ show: undefined }, true).show).toBe(false);
  });

  it(
    'separates native maxLength from count.max and treats zero as an unlimited soft maximum',
    () => {
      expect(textAreaCountInfo('oversized', { max: 3 }, true, 20)).toMatchObject(
        { content: '9 / 3', exceeded: true }
      );
      expect(textAreaCountInfo('oversized', { max: 0 }, true, 2)).toMatchObject(
        { content: '9', exceeded: false }
      );
      expect(textAreaCountInfo('abc', { max: -1 }, true)).toMatchObject(
        { content: '3', exceeded: true }
      );
    }
  );

  it('passes strategy counts and effective maximum to the winning formatter', () => {
    const showCount = { formatter: () => 'legacy' };
    const count = {
      show: ({
        value,
        count,
        maxLength
      }: { value: string; count: number; maxLength?: number; }) => `${value}:${count}:${maxLength}`,
      strategy: (value: string) => [...value].length,
      max: 2
    };

    expect(textAreaCountInfo('😀x', count, showCount, 8).content).toBe('😀x:2:2');
  });

  it('clips only with an explicit exceedFormatter and count.max after composition', () => {
    const options = {
      max: 2,
      strategy: (value: string) => [...value].length,
      exceedFormatter: (value: string, { max }: { max: number; }) => [...value].slice(0, max).join(
        ''
      )
    };

    expect(textAreaExceedValue('😀abc', options, false)).toBe('😀a');
    expect(textAreaExceedValue('😀abc', options, true)).toBe('😀abc');
    expect(textAreaExceedValue('oversized', { max: 2 }, false)).toBe('oversized');
    expect(textAreaExceedValue('oversized', { ...options, max: 0 }, false)).toBe('oversized');
  });
});

describe('TextArea clear config', () => {
  it('keeps explicit false and inherits missing icon and disabled fields', () => {
    expect(resolveTextAreaClear(false, true)).toBe(false);
    expect(resolveTextAreaClear(true, { clearIcon: 'context', disabled: true })).toEqual(
      { clearIcon: 'context', disabled: true }
    );
    expect(
      resolveTextAreaClear(
        { clearIcon: null, disabled: false },
        { clearIcon: 'context', disabled: true }
      )
    ).toEqual(
      { clearIcon: null, disabled: false }
    );
  });
});

describe('TextArea root resize forwarding', () => {
  it('respects CSS strings, quoted semicolons, comments and important priority', () => {
    expect(textAreaResizeStyle('background:url("data:a;resize:both");color:red')).toBe('');
    expect(textAreaResizeStyle('resize:vertical;resize:both')).toBe('resize:both');
    expect(textAreaResizeStyle('resize:vertical!important;resize:both')).toBe(
      'resize:vertical!important'
    );
    expect(textAreaResizeStyle('resize/* source */:var(--direction, both);height:100px')).toBe(
      'resize:var(--direction, both)'
    );
  });
});
