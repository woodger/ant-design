import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TabsContent, TabsExtraContent, TabsItem, TabsProps } from './tabs.types';

export type CardContent = TabsContent;
export type CardSlots = Partial<
  Record<'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover', string>
>;
export type CardMetaSlots = Partial<
  Record<'root' | 'section' | 'avatar' | 'title' | 'description', string>
>;
export interface CardTabItem extends Omit<TabsItem, 'label'> {
  label?: TabsContent;
  tab?: TabsContent;
}
/** Карточка с title/extra/actions, tabs и сохранением содержимого при loading. */
export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'title' | 'class' | 'style'
> {
  children?: Snippet;
  title?: CardContent;
  extra?: CardContent;
  cover?: CardContent;
  actions?: readonly CardContent[];
  /** @defaultValue false */
  loading?: boolean;
  /** @defaultValue false */
  hoverable?: boolean;
  size?: ComponentSize | 'medium' | 'default';
  type?: 'inner';
  variant?: 'outlined' | 'borderless';
  bordered?: boolean;
  headStyle?: string;
  bodyStyle?: string;
  containGrid?: boolean;
  tabList?: readonly CardTabItem[];
  /** Поддерживает bind:activeTabKey. */
  activeTabKey?: string;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultActiveTabKey?: string;
  tabBarExtraContent?: TabsExtraContent;
  tabProps?: Partial<Omit<TabsProps, 'items'>>;
  onTabChange?: (key: string) => void;
  classNames?: CardSlots | ((info: { props: CardProps; }) => CardSlots);
  styles?: CardSlots | ((info: { props: CardProps; }) => CardSlots);
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
/** Ячейка сетки Card с настраиваемым hover и нативными HTML-атрибутами. */
export interface CardGridProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  children?: Snippet;
  /** @defaultValue true */
  hoverable?: boolean;
  class?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
/** Блок avatar/title/description внутри Card. */
export interface CardMetaProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'title' | 'class' | 'style'
> {
  avatar?: CardContent;
  title?: CardContent;
  description?: CardContent;
  classNames?: CardMetaSlots | ((info: { props: CardMetaProps; }) => CardMetaSlots);
  styles?: CardMetaSlots | ((info: { props: CardMetaProps; }) => CardMetaSlots);
  class?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
