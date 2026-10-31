import { describe, expect, it } from 'vitest';
import { isOTPCompleteChange, patchOTPCells } from './input-otp.engine';

describe('patchOTPCells', () => {
  it('replaces the tail for multi-character input and preserves it for single characters', () => {
    expect(patchOTPCells(['1', '2', '9', '9', '9'], 2, '345', 6))
      .toEqual(['1', '2', '3', '4', '5']);
    expect(patchOTPCells(['1', '2', '9', '9'], 2, '3', 6)).toEqual(['1', '2', '3', '9']);
  });

  it('keeps empty intermediate cells and removes only empty trailing cells', () => {
    expect(patchOTPCells([], 5, 'A', 6)).toEqual(['', '', '', '', '', 'A']);
    expect(patchOTPCells(['1', '2', '3'], 1, '', 6)).toEqual(['1', '', '3']);
    expect(patchOTPCells(['1', '2', '3'], 2, '', 6)).toEqual(['1', '2']);
    expect(patchOTPCells(['1'], 0, '', 6)).toEqual([]);
  });

  it.each(['123 456', '123-456', '1 2 3 4 5 6'])(
    'formats pasted text before limiting its cells: %s',
    text => {
      expect(patchOTPCells([], 0, text, 4, value => value.replace(/\D/g, '')))
        .toEqual(['1', '2', '3', '4']);
    }
  );

  it('formats the whole string and preserves preceding cells during a filtered paste', () => {
    expect(patchOTPCells(['1', '2'], 2, '3-456', 6, value => value.replace(/\D/g, '')))
      .toEqual(['1', '2', '3', '4', '5', '6']);
    expect(patchOTPCells(['a', '', 'c'], 3, 'd', 6, value => value.toUpperCase()))
      .toEqual(['A', '', 'C', 'D']);
  });

  it('distinguishes a typed space from a placeholder for an empty cell', () => {
    expect(patchOTPCells(['a', '', 'c'], 1, ' ', 6)).toEqual(['a', ' ', 'c']);
    expect(patchOTPCells(['a', '', 'c'], 3, 'd', 6)).toEqual(['a', '', 'c', 'd']);
  });

  it('splits UTF-16 code units like upstream and keeps the original string when joined', () => {
    const cells = patchOTPCells([], 0, '😀x', 3);

    expect(cells.map(cell => cell.length)).toEqual([1, 1, 1]);
    expect(cells.join('')).toBe('😀x');
    expect(patchOTPCells([], 0, 'abc', 0)).toEqual([]);
  });
});

describe('isOTPCompleteChange', () => {
  it('reports only a filled code with an actually changed cell', () => {
    expect(isOTPCompleteChange(['1'], ['1', '2'], 2)).toBe(true);
    expect(isOTPCompleteChange(['1', '2'], ['1', '2'], 2)).toBe(false);
    expect(isOTPCompleteChange(['1', '2', '3'], ['1', '2'], 2)).toBe(false);
    expect(isOTPCompleteChange([], ['1', ''], 2)).toBe(false);
    expect(isOTPCompleteChange([], ['1'], 2)).toBe(false);
    expect(isOTPCompleteChange([], [], 0)).toBe(false);
    expect(isOTPCompleteChange([], [' ', '2'], 2)).toBe(true);
  });
});
