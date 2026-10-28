import type { Snippet } from 'svelte';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | 403 | 404 | 500 | '403' | '404' | '500';
export type ResultContent = string | Snippet;

export interface ResultProps {
  status?: ResultStatus;
  title?: ResultContent;
  subTitle?: ResultContent;
  icon?: Snippet | false;
  extra?: Snippet;
  children?: Snippet;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
