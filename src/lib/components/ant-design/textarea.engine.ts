import type { TextAreaAllowClear, TextAreaCountConfig, TextAreaCountInfo, TextAreaProps } from './textarea.types';

export function resolveTextAreaCount(count: TextAreaCountConfig | undefined, showCount: TextAreaProps['showCount']) {
  const merged = { show: showCount && typeof showCount === 'object' ? showCount.formatter || true : Boolean(showCount), ...count };
  const show = merged.show;
  return { ...count, show: Boolean(show), formatter: typeof show === 'function' ? show : undefined, strategy: count?.strategy || ((value: string) => value.length) };
}

export function textAreaCountInfo(value: string, count: TextAreaCountConfig | undefined, showCount: TextAreaProps['showCount'], maxLength?: number) {
  const config = resolveTextAreaCount(count, showCount);
  const info: TextAreaCountInfo = { value, count: config.strategy(value), maxLength: count?.max ?? maxLength };
  const content = config.show ? config.formatter ? config.formatter(info) : `${info.count}${Number(info.maxLength) > 0 ? ` / ${info.maxLength}` : ''}` : undefined;
  return { info, content, show: config.show, exceeded: Boolean(info.maxLength) && info.count > info.maxLength! };
}

export function textAreaExceedValue(value: string, count: TextAreaCountConfig | undefined, composing: boolean): string {
  if (!composing && count?.exceedFormatter && count.max && (count.strategy || ((text: string) => text.length))(value) > count.max) return count.exceedFormatter(value, { max: count.max });
  return value;
}

export function resolveTextAreaClear(local: TextAreaProps['allowClear'], context: TextAreaProps['allowClear']): TextAreaAllowClear | false {
  if (!(local ?? context)) return false;
  const own = typeof local === 'object' ? local : undefined;
  const inherited = typeof context === 'object' ? context : undefined;
  return { clearIcon: own?.clearIcon !== undefined ? own.clearIcon : inherited?.clearIcon, disabled: own?.disabled ?? inherited?.disabled };
}

// Из CSS-строк Svelte переносится только resize root в textarea, как style.resize в React.
export function textAreaResizeStyle(style = ''): string {
  let current = ''; let quote = ''; let depth = 0; let value = ''; let important = false;
  function declaration() {
    const match = /^\s*resize\s*:\s*(.*?)\s*$/i.exec(current);
    if (!match) return;
    const nextImportant = /!\s*important\s*$/i.test(match[1]);
    if (!important || nextImportant) { value = match[1]; important = nextImportant; }
  }
  for (let index = 0; index <= style.length; index++) {
    const char = style[index] ?? ';';
    if (char === '\\') { current += char + (style[++index] ?? ''); continue; }
    if (quote) { current += char; if (char === quote) quote = ''; continue; }
    if (char === '"' || char === "'") { quote = char; current += char; continue; }
    if (style.startsWith('/*', index)) { const end = style.indexOf('*/', index + 2); index = end < 0 ? style.length : end + 1; continue; }
    if (char === '(' || char === '[') depth++;
    if (char === ')' || char === ']') depth--;
    if (char === ';' && !depth) { declaration(); current = ''; } else current += char;
  }
  return value ? `resize:${value}` : '';
}
