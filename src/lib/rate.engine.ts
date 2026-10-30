export function getRatePointerValue(
  index: number,
  position: number | undefined,
  left: number,
  width: number,
  allowHalf: boolean,
  rtl: boolean
): number {
  const half = allowHalf
    && position !== undefined
    && (rtl
      ? position - left > width / 2
      : position - left < width / 2);
  return index + 1 - (half ? 0.5 : 0);
}

export function getRateKeyValue(
  value: number | undefined,
  count: number,
  allowHalf: boolean,
  key: string,
  rtl: boolean
): number | undefined {
  if (value === undefined) return;
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
  const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
  const step = allowHalf ? 0.5 : 1;

  if (key === forward && value < count) return value + step;
  if (key === backward && value > 0) return value - step;
}

export function getRateStarClass(
  index: number,
  value: number | undefined,
  allowHalf: boolean,
  focused: boolean
): string {
  const star = index + 1;
  const classes = ['ant-rate-star'];

  if (value === 0 && index === 0 && focused)
    classes.push('ant-rate-star-focused');
  else if (allowHalf && value !== undefined && value + 0.5 >= star && value < star) {
    classes.push('ant-rate-star-half', 'ant-rate-star-active');
    if (focused)
      classes.push('ant-rate-star-focused');
  } else {
    classes.push(value !== undefined && star <= value
      ? 'ant-rate-star-full'
      : 'ant-rate-star-zero');
    if (star === value && focused)
      classes.push('ant-rate-star-focused');
  }

  return classes.join(' ');
}
