import { describe, expect, it } from 'vitest';
import { getAvatarScale, normalizeAvatarGap, resolveAvatarSize } from './avatar.engine';

describe('Avatar size and gap', () => {
  it('inherits component size and lets an explicit size override it', () => {
    expect(resolveAvatarSize(undefined)).toBe('medium');
    expect(resolveAvatarSize(undefined, 'small')).toBe('small');
    expect(resolveAvatarSize(undefined, 'large')).toBe('large');
    expect(resolveAvatarSize('medium', 'small')).toBe('medium');
    expect(resolveAvatarSize(48, 'large')).toBe(48);
    expect(resolveAvatarSize(0.5)).toBe(0.5);
  });
  it.each([0, -1, NaN, Infinity, -Infinity])(
    'replaces invalid numeric size %s with the configured size',
    size => {
      expect(resolveAvatarSize(size)).toBe('medium');
      expect(resolveAvatarSize(size, 'small')).toBe('small');
    }
  );
  it('preserves nonnegative fractional gaps and replaces invalid values', () => {
    expect(normalizeAvatarGap()).toBe(4);
    expect(normalizeAvatarGap(0)).toBe(0);
    expect(normalizeAvatarGap(2.5)).toBe(2.5);
    for (const gap of [-1, NaN, Infinity, -Infinity])
      expect(normalizeAvatarGap(gap)).toBe(4);
  });
});

describe('Avatar text fitting', () => {
  it('shrinks wide text into the available width without enlarging short text', () => {
    expect(getAvatarScale(100, 32)).toBe(0.24);
    expect(getAvatarScale(12, 32)).toBe(1);
    expect(getAvatarScale(24, 32)).toBe(1);
    expect(getAvatarScale(100, 32, 0)).toBe(0.32);
    expect(getAvatarScale(100, 32, 2.5)).toBe(0.27);
  });
  it('keeps a finite unscaled value while hidden or when the gap leaves no space', () => {
    for (const [
      text,
      width
    ] of [
        [0, 32],
        [100, 0],
        [-1, 32],
        [100, -1],
        [NaN, 32],
        [100, Infinity]
      ])
      expect(getAvatarScale(text, width)).toBe(1);

    expect(getAvatarScale(100, 32, 16)).toBe(1);
    expect(getAvatarScale(100, 32, 100)).toBe(1);
    expect(getAvatarScale(100, 32, -1)).toBe(0.24);
  });
});
