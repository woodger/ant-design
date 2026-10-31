import {
  getBorderBeamCount,
  getBorderBeamStyle,
  type BorderBeamBorderWidth,
  type BorderBeamRuntimeOptions
} from './border-beam.engine';

export function createBorderBeamRuntime(host: HTMLElement) {
  const document = host.ownerDocument;
  const computed = document.defaultView!.getComputedStyle(host);
  const parseWidth = (value: string) => {
    const width = parseFloat(value);

    return Number.isNaN(width) ? 0 : width;
  };
  // Как useBorderSize: снимок принадлежит узлу и не обновляется при изменении его стиля.
  const widths: BorderBeamBorderWidth = [
    parseWidth(computed.borderTopWidth),
    parseWidth(computed.borderRightWidth),
    parseWidth(computed.borderBottomWidth),
    parseWidth(computed.borderLeftWidth)
  ];
  const layers: HTMLDivElement[] = [];
  let active = true;

  return {
    configure(options: BorderBeamRuntimeOptions) {
      if (!active) return;

      const count = getBorderBeamCount(options.count);

      while (layers.length > count)
        layers.pop()!.remove();

      for (let index = 0; index < count; index++) {
        const existing = layers[index];
        const layer = existing ?? document.createElement('div');
        const style = getBorderBeamStyle(options, widths, index);

        if (layer.className !== options.className)
          layer.className = options.className;

        if (layer.getAttribute('style') !== style)
          layer.setAttribute('style', style);

        if (!existing) {
          layer.setAttribute('aria-hidden', 'true');
          layers.push(layer);
          host.append(layer);
        }
      }
    },
    destroy() {
      active = false;

      for (const layer of layers)
        layer.remove();

      layers.length = 0;
    }
  };
}
