import { gridMediaQueries } from './grid.engine';
import type { GridBreakpoint, GridScreenMap } from './grid.types';

/**
 * Создаёт SSR-safe карту breakpoints без обращения к window. В браузере connect(view)
 * подписывается на matchMedia и возвращает обязательный cleanup; повторное подключение
 * снимает предыдущие подписки.
 */
export function createBreakpoint() {
  let screens = $state<GridScreenMap>({});
  let connected = $state(false);
  let dispose: (() => void) | undefined;
  let generation = 0;
  return {
    get screens() {
      return screens;
    },
    get connected() {
      return connected;
    },
    connect(view: Pick<Window, 'matchMedia'>) {
      dispose?.();
      const version = ++generation;
      const queries = Object.entries(gridMediaQueries).map(
        ([key, query]) => [key as GridBreakpoint, view.matchMedia(query)] as const
      );
      function publish() {
        if (version !== generation) return;

        screens = Object.fromEntries(queries.map(([key, media]) => [key, media.matches]));
        connected = true;
      }
      for (const [, media] of queries)
        media.addEventListener('change', publish);
      publish();
      let active = true;
      dispose = () => {
        if (!active) return;

        active = false;
        for (const [, media] of queries)
          media.removeEventListener('change', publish);
        if (version === generation) {
          generation++;
          connected = false;
        }
      };
      return dispose;
    }
  };
}
