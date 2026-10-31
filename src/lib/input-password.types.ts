import type { InputContent, InputProps, InputSemanticSlots, InputVariant } from './input.types';

/** Настройки переключателя; без visible видимость хранится внутри компонента. */
export interface InputPasswordVisibilityToggle {
  /** По умолчанию 0; disabled всегда исключает переключатель из Tab-порядка. */
  tabIndex?: number;
  /** Controlled-видимость. Без обновления этого поля пользовательское действие её не меняет. */
  visible?: boolean;
  /** Запрашивает новую видимость только после действия пользователя. */
  onVisibleChange?: (visible: boolean) => void;
}

/** Возвращает scalar или Snippet без аргументов; falsy-результат оставляет пустую кнопку. */
export type InputPasswordIconRender = (visible: boolean) => InputContent | undefined;

/** Callback получает Props с разрешёнными disabled и variant. */
export type InputPasswordSemantic =
  | InputSemanticSlots
  | ((info: { props: InputPasswordProps; }) => InputSemanticSlots | undefined);

/**
 * Настройки ConfigProvider.inputPassword. Локальные Props имеют приоритет;
 * вложенный inputPassword заменяет объект целиком. Общие настройки Input наследуются отдельно.
 */
export interface InputPasswordConfig {
  iconRender?: InputPasswordIconRender;
  variant?: InputVariant;
  class?: string;
  style?: string;
  classNames?: InputPasswordSemantic;
  styles?: InputPasswordSemantic;
}

/**
 * Svelte-экспорт React Input.Password. Сохраняет string bind:value, события и refs Input;
 * type определяется видимостью. bind:this предоставляет методы фокуса и выделения Input.
 */
export interface InputPasswordProps extends Omit<InputProps, 'classNames' | 'styles'> {
  /** По умолчанию click; hover переключает на mouseover, без скрытия на mouseleave. */
  action?: 'click' | 'hover';
  /** По умолчанию true. false скрывает кнопку, сохраняя текущую видимость и suffix wrapper. */
  visibilityToggle?: boolean | InputPasswordVisibilityToggle;
  /** Локальный renderer перекрывает ConfigProvider.inputPassword.iconRender. */
  iconRender?: InputPasswordIconRender;
  /** Приоритет: variant, bordered=false, inputPassword.variant, input.variant, outlined. */
  variant?: InputVariant;
  classNames?: InputPasswordSemantic;
  /** Root: context styles.root → context style → local styles.root → local style. */
  styles?: InputPasswordSemantic;
}
