import { getDrawerMotionDuration, getDrawerTransform } from './drawer.engine';
import type { DrawerPlacement } from './drawer.types';

export function createDrawerDialog(dialog: HTMLDialogElement, onClosing: (
  closing: boolean
) => void) {
  const panel = dialog.querySelector<HTMLElement>('.ant-drawer-content-wrapper')!;
  const mask = dialog.querySelector<HTMLElement>('.ant-drawer-mask')!;
  const view = dialog.ownerDocument.defaultView!;
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  let animations: Animation[] = [];
  let revision = 0;
  let phase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  let side: DrawerPlacement = 'right';
  let disposed = false;

  function cancelMotion() {
    revision++;
    for (const animation of animations)
      animation.cancel();
    animations = [];
  }

  function finishClose() {
    cancelMotion();
    phase = 'closed';
    if (dialog.open)
      dialog.close();
    onClosing(false);
  }

  function animate(from: string, to: string, opacity: string, opening: boolean) {
    const duration = reducedMotion.matches
      ? 0
      : getDrawerMotionDuration(
        view.getComputedStyle(dialog).getPropertyValue('--ant-motion-duration-slow')
      );
    if (!duration) {
      if (opening)
        phase = 'open'; else finishClose();
      return;
    }

    const current = revision;
    const options: KeyframeAnimationOptions = {
      duration,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'both'
    };
    const motion = panel.animate([{ transform: from }, { transform: to }], options);
    animations = [motion, mask.animate([{ opacity }, { opacity: opening ? '1' : '0' }], options)];
    void motion.finished.then(() => {
      if (disposed || current !== revision) return;

      if (opening) {
        cancelMotion();
        phase = 'open';
      } else finishClose();
    }, () => { });
  }

  function sync(open: boolean, placement: DrawerPlacement) {
    if (disposed) return;

    if (open) {
      if (dialog.open && phase !== 'closing') {
        if (side !== placement) {
          cancelMotion();
          phase = 'open';
        }
        side = placement;
        return;
      }

      const from = dialog.open
        ? view.getComputedStyle(panel).transform
        : getDrawerTransform(placement);
      const opacity = dialog.open ? view.getComputedStyle(mask).opacity : '0';
      cancelMotion();
      side = placement;
      phase = 'opening';
      onClosing(false);
      if (!dialog.open)
        dialog.showModal();
      animate(from, 'translate(0, 0)', opacity, true);
    } else if (dialog.open && phase !== 'closing') {
      const from = view.getComputedStyle(panel).transform;
      const opacity = view.getComputedStyle(mask).opacity;
      cancelMotion();
      side = placement;
      phase = 'closing';
      onClosing(true);
      animate(from, getDrawerTransform(placement), opacity, false);
    }
  }

  function handleReducedMotion() {
    if (reducedMotion.matches)
      for (const animation of animations)
        animation.finish();
  }

  reducedMotion.addEventListener('change', handleReducedMotion);

  return {
    sync,
    nativeClosed() {
      cancelMotion();
      phase = 'closed';
      onClosing(false);
    },
    destroy() {
      disposed = true;
      reducedMotion.removeEventListener('change', handleReducedMotion);
      cancelMotion();
      if (dialog.open)
        dialog.close();
    }
  };
}
