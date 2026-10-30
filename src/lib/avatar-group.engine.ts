import type { AvatarGroupItem, AvatarGroupKey } from './avatar-group.types';

export function getAvatarGroupItems(items: readonly AvatarGroupItem[], maxCount?: number) {
  const seen = new Set<AvatarGroupKey>();
  const unique = items.filter(item => {
    if (seen.has(item.key)) return false;

    seen.add(item.key);
    return true;
  });
  const limit = maxCount !== undefined && Number.isFinite(maxCount) && maxCount > 0
    ? Math.max(1, Math.trunc(maxCount))
    : unique.length;
  return { visible: unique.slice(0, limit), hidden: unique.slice(limit) };
}
