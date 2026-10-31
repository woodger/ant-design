import type { Snippet } from 'svelte';

/** Цвета в исходном порядке; проценты 0–100 масштабируются в видимые 70% луча. */
export type BorderBeamGradient = { color: string; percent: number; }[];
export type BorderBeamColor = string | BorderBeamGradient;

/**
 * Общие class/style слоёв; локальные значения имеют приоритет.
 * Nested config заменяется целиком.
 */
export interface BorderBeamConfig {
  class?: string;
  style?: string;
}

/** Декоративные CSS-лучи внутри контейнера без дополнительной обёртки. */
export interface BorderBeamProps {
  /**
   * Svelte-замена React child ref: передайте bind:this нативного контейнера
   * или bind:nativeElement компонента. Без HTMLElement декорация не создаётся.
   * Позиционирование контейнера остаётся ответственностью вызывающего кода.
   */
  target?: HTMLElement | SVGElement | null;
  children?: Snippet | string | number | boolean | null;
  /** Без значения используется градиент primary/primaryHover текущей темы. */
  color?: BorderBeamColor;
  /** Конечное число >= 1 округляется вниз; остальные значения заменяются на 1. */
  count?: number;
  /** Длительность цикла в секундах; по умолчанию 6, положительное значение переопределяет CSS. */
  duration?: number;
  /** Ширина линии; число в px. По умолчанию --ant-line-width. */
  lineWidth?: number | string;
  /**
   * Внешний отступ; число в px, строка через calc(-1 * outset).
   * Без значения используются четыре border-width, измеренные один раз при смене target.
   */
  outset?: number | string;
  /** Размер движущегося псевдоэлемента; число в px, по умолчанию 100px. */
  size?: number | string;
  class?: string;
  /** Стиль декоративных слоёв; параметры компонента задают свои CSS variables после style. */
  style?: string;
}
