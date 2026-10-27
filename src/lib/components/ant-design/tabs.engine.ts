import type { TabsItem, TabsPlacement } from './tabs.types';

export function normalizeTabsItems(items: readonly TabsItem[]): TabsItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.key)) return false;

    seen.add(item.key);
    return true;
  });
}

export function getTabsActiveKey(items: readonly TabsItem[], key: string | undefined): string | undefined {
  return items.find((item) => item.key === key && !item.disabled)?.key ?? items.find((item) => !item.disabled)?.key;
}

export function getTabsNavigationKey(items: readonly TabsItem[], current: string | undefined, direction: 'next' | 'previous' | 'first' | 'last'): string | undefined {
  const available = items.filter((item) => !item.disabled);
  if (!available.length) return undefined;
  if (direction === 'first') return available[0].key;
  if (direction === 'last') return available.at(-1)!.key;

  const index = available.findIndex((item) => item.key === current);
  if (index === -1) return direction === 'next' ? available[0].key : available.at(-1)!.key;

  return available[(index + (direction === 'next' ? 1 : -1) + available.length) % available.length].key;
}

export function getTabsPlacement(placement: TabsPlacement, direction: 'ltr' | 'rtl', mobile = false): 'top' | 'bottom' | 'left' | 'right' {
  if (placement === 'top' || placement === 'bottom') return placement;
  if (mobile) return 'top';

  return (placement === 'start') === (direction === 'ltr') ? 'left' : 'right';
}
