import { describe, expect, it } from 'vitest';
import { anchorScrollFrame, anchorSection, anchorTargetId } from './anchor.engine';

describe('Anchor source algorithms', () => {
  it('matches raw fragments including spaces and embedded hashes without decoding', () => {
    expect(anchorTargetId('/#/faq?locale=en#Q1')).toBe('/faq?locale=en#Q1');
    expect(anchorTargetId('#part two')).toBe('part two');
    expect(anchorTargetId('https://example.org/#part%20two')).toBe('part%20two');
    expect(anchorTargetId('#')).toBeUndefined();
    expect(anchorTargetId(null)).toBeUndefined();
    expect(anchorTargetId('#part\n')).toBeUndefined();
  });
  it('selects the greatest eligible top rather than the last registered link', () => {
    expect(
      anchorSection(
        [
          { href: '#first', top: -200 },
          { href: '#second', top: -10 },
          { href: '#third', top: -100 },
          { href: '#future', top: 6 }
        ],
        0
      )
    ).toBe(
      '#second'
    );
    expect(anchorSection([{ href: '#future', top: 6 }], 0)).toBe('');
    expect(anchorSection([{ href: '#a', top: 5 }, { href: '#b', top: 5 }], 0)).toBe('#a');
  });
  it('respects bounds and per-link offsets including zero and negative values', () => {
    expect(
      anchorSection(
        [{ href: '#one', top: 20 }, { href: '#two', top: 50, targetOffset: 50 }],
        20,
        0
      )
    ).toBe(
      '#two'
    );
    expect(anchorSection([{ href: '#one', top: 20, targetOffset: 0 }], 50)).toBe('');
    expect(anchorSection([{ href: '#one', top: -10, targetOffset: -15 }], 0, 5)).toBe('#one');
  });
  it('uses the upstream 450ms cubic easing and clamps the final frame', () => {
    expect(anchorScrollFrame(0, 20, 420)).toBe(20);
    expect(anchorScrollFrame(112.5, 20, 420)).toBe(45);
    expect(anchorScrollFrame(225, 20, 420)).toBe(220);
    expect(anchorScrollFrame(450, 20, 420)).toBe(420);
    expect(anchorScrollFrame(900, 420, 20)).toBe(20);
  });
});
