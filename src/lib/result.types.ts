import type { Snippet } from 'svelte';

export type ResultStatus =
  'success'
  | 'error'
  | 'info'
  | 'warning'
  | 403
  | 404
  | 500
  | '403'
  | '404'
  | '500';
export type ResultContent = string | Snippet;

/** Страница результата со статусом, иллюстрацией, title/subTitle и действиями. */
export interface ResultProps {
  /** @defaultValue 'info' */
  status?: ResultStatus;
  title?: ResultContent;
  subTitle?: ResultContent;
  icon?: Snippet | false;
  extra?: Snippet;
  children?: Snippet;
  /** @defaultValue 2 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
