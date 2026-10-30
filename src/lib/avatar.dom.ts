import { getAvatarScale } from './avatar.engine';

export function connectAvatarText(host: HTMLElement, text: HTMLElement, gap: number) {
  let active = true;
  const measure = () => {
    if (active)
      text.style.transform = `scale(${getAvatarScale(text.offsetWidth, host.offsetWidth, gap)})`;
  };
  const resize = new host.ownerDocument.defaultView!.ResizeObserver(measure);
  resize.observe(host);
  resize.observe(text);
  measure();
  return () => {
    active = false;
    resize.disconnect();
    text.style.removeProperty('transform');
  };
}
