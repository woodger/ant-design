import type { BadgeProps } from './badge.types';

type BadgeOptions = Pick<BadgeProps, 'count' | 'overflowCount' | 'showZero' | 'dot' | 'status' | 'color' | 'text'> & { hasChildren?: boolean };

export function getBadgeState({ count: sourceCount, overflowCount = 99, showZero = false, dot = false, status, color, text, hasChildren = false }: BadgeOptions) {
  const count = typeof sourceCount === 'number' && Number.isFinite(sourceCount) ? sourceCount : undefined;
  const limit = Number.isFinite(overflowCount) && overflowCount >= 0 ? overflowCount : 99;
  const zero = count === 0 || text === '0';
  const hasText = typeof text === 'function' || Boolean(text);
  const hasStatus = (status !== undefined || color !== undefined) && (count === undefined || zero && !showZero);
  const statusStandalone = !hasChildren && hasStatus && (hasText || status !== undefined || !zero);
  const showAsDot = dot && !zero;
  const hidden = (count === undefined && !hasText || zero && !showZero) && !showAsDot;

  return {
    count,
    display: showAsDot || count === undefined ? '' : count > limit ? `${limit}+` : String(count),
    hasStatus,
    statusStandalone,
    showAsDot,
    visible: statusStandalone || !hidden,
    showText: !hidden && hasText && (text !== '0' || showZero)
  };
}

export function normalizeBadgeOffset(offset: readonly [number, number] | undefined): readonly [number, number] | undefined {
  return offset ? [Number.isFinite(offset[0]) ? offset[0] : 0, Number.isFinite(offset[1]) ? offset[1] : 0] : undefined;
}
