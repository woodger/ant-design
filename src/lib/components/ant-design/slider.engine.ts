export interface SliderOptions {
  min: number;
  max: number;
  step: number;
}

export type SliderDirection = 'ltr' | 'rtl' | 'btt' | 'ttb';

export function resolveSliderOptions(options: Partial<SliderOptions> = {}): SliderOptions {
  const min = Number.isFinite(options.min) ? options.min! : 0;
  const max = Number.isFinite(options.max) ? options.max! : 100;

  return { min, max: Math.max(min, max), step: Number.isFinite(options.step) && options.step! > 0 ? options.step! : 1 };
}

function getDecimal(value: number): { integer: bigint; scale: number } {
  const [mantissa, exponent = '0'] = String(value).split('e');
  const scale = (mantissa.split('.')[1]?.length ?? 0) - Number(exponent);
  const integer = BigInt(mantissa.replace('.', ''));

  return scale >= 0 ? { integer, scale } : { integer: integer * 10n ** BigInt(-scale), scale: 0 };
}

function getGrid(value: number | undefined, options: SliderOptions) {
  const clamped = Math.max(options.min, Math.min(options.max, typeof value === 'number' && Number.isFinite(value) ? value : options.min));
  const parts = [options.min, options.max, options.step, clamped].map(getDecimal);
  const scale = Math.max(...parts.map((part) => part.scale));
  const [min, max, step, current] = parts.map((part) => part.integer * 10n ** BigInt(scale - part.scale));
  const count = (max - min) / step;
  const offset = current - min;
  const closest = offset / step + (offset % step * 2n >= step ? 1n : 0n);

  return { min, step, scale, count, index: closest > count ? count : closest };
}

function gridValue(grid: ReturnType<typeof getGrid>, index: bigint): number {
  return Number(`${grid.min + index * grid.step}e-${grid.scale}`) || 0;
}

export function normalizeSliderValue(value: number | undefined, options: SliderOptions): number {
  const grid = getGrid(value, options);

  return gridValue(grid, grid.index);
}

export function getSliderRatio(value: number, options: SliderOptions): number {
  if (options.min === options.max) return 0;

  const span = options.max - options.min;
  const ratio = Number.isFinite(span) ? (value - options.min) / span : (value / 2 - options.min / 2) / (options.max / 2 - options.min / 2);

  return Math.max(0, Math.min(1, ratio));
}

export function getSliderDirection(orientation: 'horizontal' | 'vertical', reverse: boolean, rtl: boolean): SliderDirection {
  return orientation === 'vertical' ? reverse ? 'ttb' : 'btt' : reverse !== rtl ? 'rtl' : 'ltr';
}

export function getSliderKeyValue(key: string, value: number, options: SliderOptions, direction: SliderDirection): number | undefined {
  let offset: number | 'min' | 'max';

  switch (key) {
    case 'ArrowLeft': offset = direction === 'ltr' || direction === 'btt' ? -1 : 1; break;
    case 'ArrowRight': offset = direction === 'ltr' || direction === 'btt' ? 1 : -1; break;
    case 'ArrowUp': offset = direction === 'ttb' ? -1 : 1; break;
    case 'ArrowDown': offset = direction === 'ttb' ? 1 : -1; break;
    case 'Home': offset = 'min'; break;
    case 'End': offset = 'max'; break;
    case 'PageUp': offset = 2; break;
    case 'PageDown': offset = -2; break;
    default: return undefined;
  }

  const grid = getGrid(value, options);
  const index = offset === 'min' ? 0n : offset === 'max' ? grid.count : grid.index + BigInt(offset);

  return gridValue(grid, index < 0n ? 0n : index > grid.count ? grid.count : index);
}
