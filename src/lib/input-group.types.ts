import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { SpaceCompactProps } from './space-compact.types';

/**
 * Совместимость с deprecated Input.Group; для нового кода используйте SpaceCompact.
 * Root — div SpaceCompact. React children-array заменяется keyed items;
 * children snippet считается одним логическим item.
 * @deprecated Используйте SpaceCompact.
 */
export interface InputGroupProps {
  children?: Snippet;
  items?: SpaceCompactProps['items'];
  /** Legacy CSS-класс; не задаёт размер Compact context, который наследуется из ConfigProvider. */
  size?: 'large' | 'small' | 'default';
  /** Legacy CSS-класс ant-input-group-compact; SpaceCompact используется при любом значении. */
  compact?: boolean;
  class?: string;
  style?: string;
  onMouseEnter?: HTMLAttributes<HTMLDivElement>['onmouseenter'];
  onMouseLeave?: HTMLAttributes<HTMLDivElement>['onmouseleave'];
  /** Native focusin на корневом div, всплывающий от дочерних controls. */
  onFocus?: HTMLAttributes<HTMLDivElement>['onfocusin'];
  /** Native focusout на корневом div. */
  onBlur?: HTMLAttributes<HTMLDivElement>['onfocusout'];
  /** Svelte binding на корневой div; отсутствует, если группа пуста. */
  nativeElement?: HTMLDivElement;
}
