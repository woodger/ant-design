export function createFloatButtonMotion(
  node: HTMLElement,
  menu: boolean,
  remove: () => void,
  initialTarget?: boolean
) {
  const view = node.ownerDocument.defaultView!;
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  let active = true;
  let target = initialTarget;
  let animation: Animation | undefined;
  let revision = 0;
  function cancel() {
    revision++;
    animation?.cancel();
    animation = undefined;
  }
  function reduce() {
    if (reduced.matches)
      animation?.finish();
  }
  reduced.addEventListener('change', reduce);
  return {
    sync(visible: boolean) {
      if (!active) return;
      if (target === visible) {
        if (!visible && !animation)
          remove();
        return;
      }
      target = visible;
      const style = view.getComputedStyle(node);
      const from = animation ? { opacity: style.opacity, transform: style.transform } : undefined;
      cancel();
      const token = style.getPropertyValue(
        menu ? '--ant-motion-duration-slow' : '--ant-motion-duration-mid'
      ).trim();
      const parsed = parseFloat(token) * (token.endsWith('ms') ? 1 : 1000);
      const duration = reduced.matches
        ? 0
        : Number.isFinite(parsed) && parsed >= 0 ? parsed : menu ? 300 : 200;
      if (!duration) {
        if (!visible)
          remove();
        return;
      }
      const shift = menu
        ? style.getPropertyValue('--ant-float-btn-list-transform-start').trim()
        || 'translate(0,40px)'
        : 'none';
      const current = revision;
      animation = node.animate([
        from ?? { opacity: visible ? '0' : '1', transform: visible ? shift : 'none' },
        { opacity: visible ? '1' : '0', transform: visible ? 'none' : shift }
      ], { duration, easing: menu ? 'ease' : 'cubic-bezier(0.645,0.045,0.355,1)', fill: 'both' });
      void animation.finished.then(() => {
        if (!active || revision !== current) return;
        cancel();
        if (!visible)
          remove();
      }, () => { });
    },
    destroy() {
      active = false;
      cancel();
      reduced.removeEventListener('change', reduce);
    }
  };
}
