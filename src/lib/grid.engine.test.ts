import { describe, expect, it } from 'vitest';
import {
  gridColClasses,
  gridGutters,
  gridHalfGutter,
  gridResponsiveValue,
  parseGridFlex
} from './grid.engine';

describe('Grid layout rules', () => {
  it('uses the largest configured gutter for SSR but leaves responsive alignment unset', () => {
    expect(gridGutters({ xs: 8, md: 24, xxxl: 48 }, null)).toEqual([48, undefined]);
    expect(gridResponsiveValue({ xs: 'top', md: 'middle' }, null)).toBeUndefined();
    expect(gridGutters([{ xs: 8, md: 24 }, { xs: 4, sm: 12 }], { xs: true })).toEqual([8, 4]);
    expect(gridGutters([{ xs: 8, md: 24 }, { xs: 4, sm: 12 }], { sm: true, md: true })).toEqual(
      [24, 12]
    );
  });
  it('keeps zero and missing gaps distinct and preserves CSS unit calculations', () => {
    expect(gridGutters(0, null)).toEqual([0, undefined]);
    expect(gridGutters([16, 0], null)).toEqual([16, 0]);
    expect(gridHalfGutter(16, true)).toBe('-8px');
    expect(gridHalfGutter('2rem')).toBe('calc(2rem / 2)');
    expect(gridHalfGutter(0)).toBeUndefined();
  });
  it.each(
    [
      [2, '2 2 auto'],
      [0, '0 0 auto'],
      ['auto', '1 1 auto'],
      ['none', 'none'],
      ['120px', '0 0 120px'],
      ['25%', '0 0 25%'],
      ['1', '1'],
      ['1 0 auto', '1 0 auto']
    ]
  )(
    'parses flex %s like Col',
    (value, expected) => {
      expect(parseGridFlex(value)).toBe(expected);
    }
  );
  it(
    'keeps responsive zero resets and flex variables, while omitting base zero classes',
    () => {
      const result = gridColClasses(
        {
          span: 0,
          order: 0,
          push: 0,
          xs: { span: '12', order: 0, push: 0, offset: 0, flex: 0 },
          xxxl: { span: 6, flex: '120px' }
        }
      );

      expect(result.classes).toEqual(
        [
          'ant-col-0',
          'ant-col-xs-12',
          'ant-col-xs-order-0',
          'ant-col-xs-offset-0',
          'ant-col-xs-push-0',
          'ant-col-xs-flex',
          'ant-col-xxxl-6',
          'ant-col-xxxl-flex'
        ]
      );
      expect(result.variables).toBe('--ant-col-xs-flex:0 0 auto;--ant-col-xxxl-flex:0 0 120px');
      expect(gridColClasses({ md: '12' }).classes).toEqual([]);
    }
  );
});
