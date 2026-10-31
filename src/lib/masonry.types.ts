import type { Snippet } from 'svelte';
import type { GridGutter, GridResponsive } from './grid.types';

export type MasonryKey = string | number;
export type MasonryContent = string | number | boolean | null | Snippet;

/** Данные одной ячейки; key должен быть уникален после преобразования в строку. */
export interface MasonryItemType<Data = unknown> {
  key: MasonryKey;
  /** Предпочтительная колонка; верхняя граница ограничена columns - 1. */
  column?: number;
  /** Поле эталонного API; раскладка использует измеренную DOM-высоту, а не это значение. */
  height?: number;
  /**
   * Любое значение кроме null/undefined перекрывает itemRender,
   * включая 0/false/пустую строку.
   */
  children?: MasonryContent;
  data: Data;
}

export type MasonryRenderInfo<Data = unknown> = MasonryItemType<Data> & {
  index: number;
  column: number;
};

export type MasonrySemanticSlots = Partial<Record<'root' | 'item', string>>;
/** Semantic callbacks получают Props с разрешённым числом columns. */
export type MasonrySemantic<Data = unknown> = MasonrySemanticSlots
  | ((info: { props: MasonryProps<Data>; }) => MasonrySemanticSlots | undefined);

/** Настройки слоёв root/item; nested config заменяется целиком. */
export interface MasonryConfig {
  class?: string;
  style?: string;
  // Тип данных экземпляра неизвестен общему ConfigProvider, как в upstream MasonryProps<any>.
  classNames?: MasonrySemantic<any>;
  styles?: MasonrySemantic<any>;
}

/** Измеряемая раскладка элементов разной высоты в самые короткие колонки. */
export interface MasonryProps<Data = unknown> {
  /** Как в React PropsWithChildren, принимается, но не используется для отображения ячеек. */
  children?: MasonryContent;
  /** Элементы появляются после mount, как в React useEffect; на SSR root пустой. */
  items?: MasonryItemType<Data>[];
  /** Svelte snippet вместо React renderer; вызывается, когда у item нет children. */
  itemRender?: Snippet<[MasonryRenderInfo<Data>]>;
  /**
   * Положительное целое число либо responsive map. По умолчанию 3;
   * для map без совпадения берётся xs, затем 1. Число не округляется.
   */
  columns?: number | GridResponsive<number>;
  /** По умолчанию 0; одиночное значение применяется к обеим осям. */
  gutter?: GridGutter | [GridGutter, GridGutter];
  /** Дополнительно наблюдает размеры ячеек; по умолчанию только root и image load/error. */
  fresh?: boolean;
  /**
   * Изменение распределения: элементы в исходном порядке с вычисленным column.
   * Содержит исходные поля item; одинаковые данные не порождают повторный callback.
   */
  onLayoutChange?: (items: (MasonryItemType<Data> & { column: number; })[]) => void;
  class?: string;
  rootClassName?: string;
  /** Локальный root style идёт после semantic root, context и вычисленной высоты. */
  style?: string;
  classNames?: MasonrySemantic<Data>;
  /** Геометрия ячеек идёт после semantic item styles. */
  styles?: MasonrySemantic<Data>;
  /** bind:nativeElement возвращает корневой div и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
