export interface InputNumberOptions {
  min: number;
  max: number;
  step: number;
  precision?: number;
}

export function normalizeInputNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value || 0 : null;
}

export function parseInputNumber(text: string): number | null | undefined {
  const trimmed = text.trim();

  if (!trimmed) return null;
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) return undefined;

  const value = Number(trimmed);

  return Number.isFinite(value) ? value || 0 : undefined;
}

export function resolveInputNumberOptions(options: Partial<InputNumberOptions> = {}): InputNumberOptions {
  return {
    min: Number.isFinite(options.min) ? options.min! : Number.MIN_SAFE_INTEGER,
    max: Number.isFinite(options.max) ? options.max! : Number.MAX_SAFE_INTEGER,
    step: Number.isFinite(options.step) && options.step! > 0 ? options.step! : 1,
    precision: Number.isInteger(options.precision) && options.precision! >= 0 && options.precision! <= 100 ? options.precision : undefined
  };
}

export function isInputNumberInRange(value: number, options: InputNumberOptions): boolean {
  return Number.isFinite(value) && value >= options.min && value <= options.max;
}

function getDecimal(value: number): { integer: bigint; scale: number } {
  const [mantissa, exponent = '0'] = String(value).split('e');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  const scale = fraction - Number(exponent);
  const integer = BigInt(mantissa.replace('.', ''));

  return scale >= 0 ? { integer, scale } : { integer: integer * 10n ** BigInt(-scale), scale: 0 };
}

function quantize(value: number, precision: number, rounding: 'round' | 'floor' | 'ceil' = 'round'): bigint {
  const { integer, scale } = getDecimal(value);

  if (scale <= precision) return integer * 10n ** BigInt(precision - scale);

  const divisor = 10n ** BigInt(scale - precision);
  const quotient = integer / divisor;
  const remainder = integer < 0n ? -(integer % divisor) : integer % divisor;

  if (!remainder) return quotient;
  if (rounding === 'floor') return integer < 0n ? quotient - 1n : quotient;
  if (rounding === 'ceil') return integer > 0n ? quotient + 1n : quotient;

  return remainder * 2n >= divisor ? quotient + (integer < 0n ? -1n : 1n) : quotient;
}

function decimalToNumber(integer: bigint, scale: number): number {
  return Number(`${integer}e-${scale}`) || 0;
}

export function formatInputNumber(value: number | null, precision?: number): string {
  if (value === null) return '';
  if (precision === undefined) return String(value);

  const integer = quantize(value, precision);
  const digits = String(integer < 0n ? -integer : integer).padStart(precision + 1, '0');
  const sign = integer < 0n ? '-' : '';

  return precision ? `${sign}${digits.slice(0, -precision)}.${digits.slice(-precision)}` : `${sign}${digits}`;
}

export function commitInputNumber(value: number | null, options: InputNumberOptions): number | null | undefined {
  if (value === null) return null;
  if (options.min > options.max || !Number.isFinite(value)) return undefined;

  const clamped = Math.max(options.min, Math.min(options.max, value));
  const precision = options.precision;

  if (precision === undefined) return clamped;

  let rounded = decimalToNumber(quantize(clamped, precision), precision);

  if (rounded < options.min) rounded = decimalToNumber(quantize(options.min, precision, 'ceil'), precision);
  if (rounded > options.max) rounded = decimalToNumber(quantize(options.max, precision, 'floor'), precision);

  return isInputNumberInRange(rounded, options) ? rounded : undefined;
}

export function stepInputNumber(value: number | null, direction: 1 | -1, options: InputNumberOptions): number | null {
  if (options.min > options.max || value !== null && (direction > 0 ? value >= options.max : value <= options.min)) return null;

  const current = getDecimal(value ?? 0);
  const step = getDecimal(options.step);
  const scale = Math.max(current.scale, step.scale);
  // Десятичный шаг складывается до преобразования в number, без хвостов вроде 0.30000000000000004.
  const integer = current.integer * 10n ** BigInt(scale - current.scale)
    + BigInt(direction) * step.integer * 10n ** BigInt(scale - step.scale);
  const candidate = decimalToNumber(integer, scale);
  const next = commitInputNumber(Number.isFinite(candidate) ? candidate : direction > 0 ? options.max : options.min, options);

  return next === undefined || next === value ? null : next;
}
