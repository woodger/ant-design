import { describe, expect, it } from 'vitest';
import {
  getBorderBeamCount,
  getBorderBeamGradient,
  getBorderBeamStyle
} from './border-beam.engine';

describe('BorderBeam engine', () => {
  it('keeps one beam for invalid counts and floors finite positive counts', () => {
    expect([undefined, 0, -1, NaN, Infinity, -Infinity].map(getBorderBeamCount))
      .toEqual([1, 1, 1, 1, 1, 1]);
    expect([1, 1.9, 3, 3.9].map(getBorderBeamCount)).toEqual([1, 1, 3, 3]);
  });

  it('reserves a transparent tail for solid colors and leaves empty colors to the theme', () => {
    expect(getBorderBeamGradient()).toBeUndefined();
    expect(getBorderBeamGradient([])).toBeUndefined();
    expect(getBorderBeamGradient('#36cfc9')).toBe(
      'linear-gradient(to left, #36cfc9 0%, #36cfc9 70%, transparent)'
    );
  });

  it('scales gradient stops without sorting or mutating the supplied colors', () => {
    const color = [
      { color: 'red', percent: -10 },
      { color: 'green', percent: 55 },
      { color: 'blue', percent: 120 },
      { color: 'black', percent: 33.333 }
    ];

    const gradient = getBorderBeamGradient(color);

    expect(gradient).toBe(
      'linear-gradient(to left, red 0%, green 38.5%, blue 70%, black 23.33%, black 70%, transparent)'
    );
    expect(color).toEqual([
      { color: 'red', percent: -10 },
      { color: 'green', percent: 55 },
      { color: 'blue', percent: 120 },
      { color: 'black', percent: 33.333 }
    ]);
    expect(getBorderBeamGradient([{ color: 'blue', percent: 100 }])).toBe(
      'linear-gradient(to left, blue 70%, transparent)'
    );
  });

  it('infers all four outsets and preserves numeric and CSS unit conventions', () => {
    const defaults = getBorderBeamStyle({ className: '' }, [0, 2, 3.5, 4], 0);
    const pixels = getBorderBeamStyle(
      { className: '', lineWidth: 0, size: 160, outset: 4 },
      [1, 1, 1, 1],
      0
    );
    const css = getBorderBeamStyle(
      { className: '', lineWidth: '0.25rem', size: '12em', outset: '2em' },
      [1, 1, 1, 1],
      0
    );

    expect(defaults).toBe('--ant-border-beam-inset-offset:-0px -2px -3.5px -4px');
    expect(pixels).toBe(
      '--ant-border-beam-line-width:0px;--ant-border-beam-size:160px;--ant-border-beam-inset-offset:-4px'
    );
    expect(css).toBe(
      '--ant-border-beam-line-width:0.25rem;--ant-border-beam-size:12em;--ant-border-beam-inset-offset:calc(-1 * 2em)'
    );
    expect(getBorderBeamStyle({ className: '', outset: -2 }, [0, 0, 0, 0], 0))
      .toBe('--ant-border-beam-inset-offset:--2px');
  });

  it('distributes phases from the duration prop while retaining first-beam custom delay', () => {
    const options = { className: '', count: 3, duration: 12 };

    expect(getBorderBeamStyle(options, [1, 1, 1, 1], 0)).not.toContain('--ant-border-beam-delay');
    expect(getBorderBeamStyle(options, [1, 1, 1, 1], 1))
      .toContain('--ant-border-beam-delay:-4s');
    expect(getBorderBeamStyle(options, [1, 1, 1, 1], 2))
      .toContain('--ant-border-beam-delay:-8s');

    for (const duration of [undefined, 0, -1, NaN]) {
      const style = getBorderBeamStyle({ className: '', count: 3, duration }, [0, 0, 0, 0], 1);

      expect(style).not.toContain('--ant-border-beam-duration:');
      expect(style).toContain('--ant-border-beam-delay:-2s');
    }

    expect(getBorderBeamStyle({ className: '', duration: Infinity }, [0, 0, 0, 0], 0))
      .toContain('--ant-border-beam-duration:Infinitys');
  });

  it('places explicit props after context and local styles without replacing custom defaults', () => {
    const style = getBorderBeamStyle(
      {
        className: '',
        contextStyle: 'opacity:0.5;--ant-border-beam-size:80px',
        style: 'opacity:0.8;--ant-border-beam-size:90px;--ant-border-beam-delay:1s',
        size: 160,
        count: 2
      },
      [2, 2, 2, 2],
      0
    );

    expect(style).toBe(
      'opacity:0.5;--ant-border-beam-size:80px;opacity:0.8;--ant-border-beam-size:90px;--ant-border-beam-delay:1s;--ant-border-beam-size:160px;--ant-border-beam-inset-offset:-2px -2px -2px -2px'
    );
  });
});
