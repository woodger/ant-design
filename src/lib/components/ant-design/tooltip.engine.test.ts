import { describe, expect, it } from 'vitest';
import { getTooltipDelay, getTooltipPosition } from './tooltip.engine';

describe('Tooltip positioning', () => {
  const anchor = { x: 200, y: 160, width: 80, height: 40 };
  const popup = { width: 120, height: 32 };
  const viewport = { x: 0, y: 0, width: 600, height: 400 };

  it.each([
    ['top', 180, 120], ['bottom', 180, 208], ['left', 72, 164], ['right', 288, 164]
  ] as const)('positions %s around the anchor', (placement, left, top) => {
    expect(getTooltipPosition(anchor, popup, viewport, placement)).toMatchObject({ placement, left, top, ...(placement === 'top' || placement === 'bottom' ? { arrowX: 60 } : { arrowY: 16 }) });
  });

  it.each([
    ['top', { x: 200, y: 4, width: 80, height: 20 }, 'bottom'],
    ['bottom', { x: 200, y: 380, width: 80, height: 20 }, 'top'],
    ['left', { x: 2, y: 100, width: 20, height: 40 }, 'right'],
    ['right', { x: 580, y: 100, width: 20, height: 40 }, 'left']
  ] as const)('flips %s to %s when the opposite side has more room', (placement, target, expected) => {
    expect(getTooltipPosition(target, popup, viewport, placement).placement).toBe(expected);
  });

  it('shifts a tooltip inside the viewport and keeps its arrow pointed at the anchor', () => {
    const position = getTooltipPosition({ x: 0, y: 100, width: 40, height: 20 }, popup, viewport, 'top');

    expect(position.left).toBe(8);
    expect(position.arrowX).toBe(16);
    expect(position.top).toBe(60);
  });

  it('clamps the arrow away from rounded corners on the right edge', () => {
    const position = getTooltipPosition({ x: 580, y: 100, width: 20, height: 20 }, popup, viewport, 'top');

    expect(position.left).toBe(472);
    expect(position.arrowX).toBe(104);
  });

  it('accounts for visual viewport offsets instead of assuming a zero origin', () => {
    const position = getTooltipPosition({ x: 105, y: 160, width: 20, height: 20 }, popup, { x: 100, y: 50, width: 300, height: 250 }, 'top');

    expect(position.left).toBe(108);
    expect(position.top).toBe(120);
  });

  it('preserves the requested placement and overflow when adjustment is disabled', () => {
    const position = getTooltipPosition({ x: 0, y: 0, width: 20, height: 20 }, popup, viewport, 'top', false);

    expect(position.left).toBe(-50);
    expect(position.top).toBe(-40);
    expect(position.placement).toBe('top');
  });

  it('centers an arrow in a small popup without inverted bounds', () => {
    const position = getTooltipPosition(anchor, { width: 20, height: 10 }, viewport, 'top');

    expect(position.arrowX).toBe(10);
    expect(position.arrowY).toBe(5);
  });

  it('uses the larger available side when neither side can fit', () => {
    const position = getTooltipPosition({ x: 100, y: 20, width: 20, height: 20 }, { width: 100, height: 150 }, { x: 0, y: 0, width: 240, height: 120 }, 'top');

    expect(position.placement).toBe('bottom');
    expect(position.top).toBe(8);
  });

  it.each([['left', 200, 40], ['right', 160, 80]] as const)('aligns a vertical menu to the %s edge', (align, left, arrowX) => {
    expect(getTooltipPosition(anchor, popup, viewport, 'bottom', true, align)).toMatchObject({ left, top: 208, arrowX });
  });

  it('preserves edge alignment when flipping and clamps it at the viewport boundary', () => {
    expect(getTooltipPosition({ ...anchor, y: 380 }, popup, viewport, 'bottom', true, 'right')).toMatchObject({ placement: 'top', left: 160 });
    expect(getTooltipPosition({ ...anchor, x: 580 }, popup, viewport, 'bottom', true, 'left').left).toBe(472);
    expect(getTooltipPosition({ ...anchor, x: 0 }, popup, viewport, 'top', false, 'right').left).toBe(-40);
  });

  it('aligns side submenus to the top edge through flipping and viewport clamping', () => {
    expect(getTooltipPosition(anchor, popup, viewport, 'right', true, 'top')).toMatchObject({ left: 288, top: 160 });
    expect(getTooltipPosition({ ...anchor, x: 580 }, popup, viewport, 'right', true, 'top')).toMatchObject({ placement: 'left', top: 160 });
    expect(getTooltipPosition({ ...anchor, y: 390 }, popup, viewport, 'left', true, 'top').top).toBe(360);
  });
});

describe('Tooltip delays', () => {
  it('converts seconds to milliseconds and preserves zero and fractional delays', () => {
    expect(getTooltipDelay(undefined)).toBe(100);
    expect(getTooltipDelay(0)).toBe(0);
    expect(getTooltipDelay(0.25)).toBe(250);
  });

  it('normalizes negative and non-finite delays and caps host timer overflow', () => {
    expect(getTooltipDelay(-1)).toBe(0);
    expect(getTooltipDelay(NaN)).toBe(100);
    expect(getTooltipDelay(Infinity)).toBe(100);
    expect(getTooltipDelay(1e20)).toBe(2_147_483_647);
  });
});
