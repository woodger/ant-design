import { siderMaxWidths } from './layout.engine';
import type { GridBreakpoint } from './grid.types';

export function connectSiderBreakpoint(
  view: Pick<Window, 'matchMedia'>,
  breakpoint: GridBreakpoint,
  update: (broken: boolean) => void
) {
  const media = view.matchMedia(`screen and (max-width: ${siderMaxWidths[breakpoint]})`);
  let active = true;
  function publish() {
    if (active)
      update(media.matches);
  }
  media.addEventListener('change', publish);
  publish();
  return () => {
    active = false;
    media.removeEventListener('change', publish);
  };
}
