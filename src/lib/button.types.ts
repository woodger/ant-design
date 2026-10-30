import type { Snippet } from 'svelte';
import type {
  HTMLButtonAttributes,
  HTMLAnchorAttributes,
  MouseEventHandler
} from 'svelte/elements';
import type { ComponentSize } from './types';
export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type ButtonColor =
  'default'
  | 'primary'
  | 'danger'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold';
export type ButtonShape = 'default' | 'circle' | 'round' | 'square';
export type ButtonContent = string | number | boolean | null | undefined | Snippet;
export type ButtonSlots = Partial<Record<'root' | 'icon' | 'content', string>>;
export type ButtonLoading = boolean | { delay?: number; icon?: ButtonContent; };
/** Кнопка Ant Design с нативными атрибутами, вариантами оформления и loading. */
export interface ButtonProps extends Omit<
  HTMLButtonAttributes,
  'type' | 'children' | 'class' | 'color' | 'style' | 'onclick'
> {
  children?: ButtonContent;
  icon?: ButtonContent;
  type?: ButtonType;
  /** Нативный type кнопки; prop type задаёт оформление Ant Design. */
  htmlType?: 'button' | 'submit' | 'reset';
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ComponentSize | 'medium';
  /** true включает ожидание; delay задаётся в миллисекундах, icon заменяет индикатор. */
  loading?: ButtonLoading;
  /** @defaultValue false */
  danger?: boolean;
  /** @defaultValue false */
  block?: boolean;
  /** @defaultValue false */
  ghost?: boolean;
  shape?: ButtonShape;
  /** Имеет приоритет над совместимым alias iconPosition. */
  iconPlacement?: 'start' | 'end';
  iconPosition?: 'start' | 'end';
  target?: HTMLAnchorAttributes['target'];
  rel?: HTMLAnchorAttributes['rel'];
  download?: HTMLAnchorAttributes['download'];
  hreflang?: string;
  referrerpolicy?: HTMLAnchorAttributes['referrerpolicy'];
  /** Нативный обработчик; имеет приоритет над совместимым onClick. */
  onclick?: MouseEventHandler<HTMLButtonElement> | null;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  autoFocus?: boolean;
  autoInsertSpace?: boolean;
  /** Semantic slots или callback с параметрами оформления; без обработчиков клика. */
  classNames?: ButtonSlots | ((info: { props: ButtonSemanticProps; }) => ButtonSlots | undefined);
  styles?: ButtonSlots | ((info: { props: ButtonSemanticProps; }) => ButtonSlots | undefined);
  class?: string;
  rootClassName?: string;
  style?: HTMLButtonAttributes['style'];
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLButtonElement | HTMLAnchorElement;
  /** Внутренняя композиция FloatButton: отключает повторное применение semantic styles. */
  _skipSemantic?: boolean;
  /** FloatButton передаёт оформленный content и Badge без дополнительного span. */
  _skipContentWrapper?: boolean;
}
/** Параметры оформления Button для semantic callbacks без обработчиков клика. */
export type ButtonSemanticProps = Omit<ButtonProps, 'onclick' | 'onClick'>;
/** Параметры Button с типом события клика, зависящим от наличия href. */
export type ButtonElementProps<Href extends
  string
  | undefined = undefined> = Omit<
    ButtonProps,
    'onclick' | 'onClick'
  > & {
    href?: Href;
    onclick?: MouseEventHandler<Href extends string ? HTMLAnchorElement : HTMLButtonElement> | null;
    onClick?: MouseEventHandler<Href extends string ? HTMLAnchorElement : HTMLButtonElement>;
  };
/** Вариант Button с обязательным href и нативным событием ссылки. */
export interface ButtonLinkProps extends Omit<ButtonProps, 'onclick' | 'onClick'> {
  href: string;
  onclick?: MouseEventHandler<HTMLAnchorElement> | null;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** Настройки ConfigProvider.button; локальные props и стили Button имеют приоритет. */
export interface ButtonConfig {
  autoInsertSpace?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  loadingIcon?: ButtonContent;
  class?: string;
  style?: string;
  classNames?: ButtonProps['classNames'];
  styles?: ButtonProps['styles'];
}
/** Общий визуальный размер и контейнер для группы Button. */
export interface ButtonGroupProps {
  children?: Snippet;
  size?: ComponentSize | 'medium';
  class?: string;
  style?: string;
  id?: string;
  'aria-label'?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
