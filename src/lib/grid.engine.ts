import type { ColProps, GridGap, GridGutter, GridResponsive, GridScreenMap } from './grid.types';

export const gridBreakpoints = ['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
export const gridMediaQueries = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
  xxxl: '(min-width: 1920px)'
} as const;

export function gridResponsiveValue<Value>(
  value: Value | GridResponsive<Value>,
  screens: GridScreenMap | null
): Value | undefined {
  if (typeof value !== 'object' || value === null) return value as Value;

  for (const key of gridBreakpoints)
    if (screens?.[key]
      && (value as GridResponsive<Value>)[key] !== undefined) return (value as GridResponsive<
        Value
      >)[key];
  return undefined;
}

export function gridGutters(
  gutter: GridGutter | [GridGutter, GridGutter],
  screens: GridScreenMap | null
): [GridGap, GridGap] {
  const values = Array.isArray(gutter) ? gutter : [gutter, undefined];
  // useGutter эталона при SSR/null считает все breakpoints совпавшими.
  const available = screens ?? Object.fromEntries(gridBreakpoints.map(key => [key, true]));
  return values.map(value => gridResponsiveValue(value, available)) as [GridGap, GridGap];
}

export function parseGridFlex(value: string | number): string {
  if (value === 'auto') return '1 1 auto';
  if (typeof value === 'number' && !Number.isNaN(value)) return `${value} ${value} auto`;
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(String(value))) return `0 0 ${value}`;
  return String(value);
}

export function gridColClasses(props: ColProps): { classes: string[]; variables: string; } {
  const classes: string[] = [];
  const variables: string[] = [];
  if (props.span !== undefined)
    classes.push(`ant-col-${props.span}`);
  for (const key of ['order', 'offset', 'push', 'pull'] as const)
    if (props[key])
      classes.push(`ant-col-${key}-${props[key]}`);
  for (const breakpoint of [...gridBreakpoints].reverse()) {
    const value = props[breakpoint];
    const options = typeof value === 'number' && !Number.isNaN(value)
      ? { span: value }
      : typeof value === 'object' && value !== null ? value : {};
    if (options.span !== undefined && options.span !== null)
      classes.push(`ant-col-${breakpoint}-${options.span}`);
    for (const key of ['order', 'offset', 'push', 'pull'] as const)
      if (options[key] || options[key] === 0)
        classes.push(`ant-col-${breakpoint}-${key}-${options[key]}`);
    if (options.flex || options.flex === 0) {
      classes.push(`ant-col-${breakpoint}-flex`);
      variables.push(`--ant-col-${breakpoint}-flex:${parseGridFlex(options.flex)}`);
    }
  }
  return { classes, variables: variables.join(';') };
}

export function gridHalfGutter(value: GridGap, negative = false): string | undefined {
  if (!value) return undefined;
  return typeof value === 'number' && !Number.isNaN(value)
    ? `${value / (negative ? -2 : 2)}px`
    : `calc(${value} / ${negative ? -2 : 2})`;
}
