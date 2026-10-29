import type { CardContent, CardProps } from './card.types';
import type { TabsItem } from './tabs.types';

export function cardHasContent(value: CardContent | undefined): boolean {
  return value !== undefined && value !== null && value !== false && value !== '';
}
export function cardTabItems(items: CardProps['tabList']): TabsItem[] {
  return (items ?? []).map(item => {
    const { tab, ...rest } = item;
    return { ...rest, label: Object.hasOwn(item, 'label') ? item.label ?? null : tab ?? '' };
  });
}
