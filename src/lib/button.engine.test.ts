import { describe, expect, it } from 'vitest';
import {
  buttonAppearance,
  buttonHasContent,
  buttonLoading,
  buttonText,
  buttonTwoCN
} from './button.engine';

describe('Button source precedence', () => {
  it('resolves legacy type, danger and the complete color/variant pair before context', () => {
    expect(buttonAppearance('primary', true)).toEqual({ color: 'danger', variant: 'solid' });
    expect(buttonAppearance('link')).toEqual({ color: 'link', variant: 'link' });
    expect(buttonAppearance('primary', true, 'green', 'filled')).toEqual(
      { color: 'green', variant: 'filled' }
    );
    expect(buttonAppearance('text', false, 'red')).toEqual({ color: 'default', variant: 'text' });
    expect(
      buttonAppearance(
        'default',
        false,
        undefined,
        undefined,
        false,
        { color: 'green', variant: 'filled' }
      )
    ).toEqual(
      { color: 'default', variant: 'outlined' }
    );
  });
  it('keeps source partial-pair behavior and gives a solid variant primary by default', () => {
    expect(buttonAppearance(undefined, false, 'green')).toEqual(
      { color: 'default', variant: 'outlined' }
    );
    expect(buttonAppearance(undefined, false, undefined, 'filled')).toEqual(
      { color: 'default', variant: 'outlined' }
    );
    expect(
      buttonAppearance(
        undefined,
        false,
        undefined,
        'solid',
        false,
        { color: 'green', variant: 'filled' }
      )
    ).toEqual(
      { color: 'primary', variant: 'solid' }
    );
    expect(
      buttonAppearance(
        undefined,
        false,
        undefined,
        undefined,
        false,
        { color: 'green', variant: 'filled' }
      )
    ).toEqual(
      { color: 'green', variant: 'filled' }
    );
    expect(buttonAppearance(undefined, false, undefined, undefined, false, { variant: 'solid' }))
      .toEqual(
        { color: 'primary', variant: 'solid' }
      );
  });
  it('turns solid into outlined for ghost while retaining the chosen color', () => {
    expect(buttonAppearance('primary', false, undefined, undefined, true)).toEqual(
      { color: 'primary', variant: 'outlined' }
    );
    expect(buttonAppearance('link', false, undefined, undefined, true)).toEqual(
      { color: 'link', variant: 'link' }
    );
  });
  it('derives initial loading from source numeric delay rules including special values', () => {
    expect(buttonLoading(true)).toEqual({ loading: true, delay: 0 });
    expect(buttonLoading(false)).toEqual({ loading: false, delay: 0 });
    expect(buttonLoading({})).toEqual({ loading: true, delay: 0 });
    expect(buttonLoading({ delay: -1 })).toEqual({ loading: true, delay: -1 });
    expect(buttonLoading({ delay: 100 })).toEqual({ loading: false, delay: 100 });
    expect(buttonLoading({ delay: NaN })).toEqual({ loading: false, delay: NaN });
  });
  it(
    'keeps renderable zero and true and inserts spacing only for exactly two source-range Chinese characters',
    () => {
      expect(buttonHasContent(0)).toBe(true);
      expect(buttonHasContent(true)).toBe(true);
      expect(buttonHasContent(false)).toBe(false);
      expect(buttonHasContent('')).toBe(false);
      expect(buttonText('按钮', true)).toBe('按 钮');
      expect(buttonText('按钮', false)).toBe('按钮');
      expect(buttonTwoCN('大按钮')).toBe(false);
      expect(buttonTwoCN('按 钮')).toBe(false);
      expect(buttonTwoCN('你好!')).toBe(false);
      expect(buttonTwoCN('𠀀𠀁')).toBe(false);
    }
  );
});
