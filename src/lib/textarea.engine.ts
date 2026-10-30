export {
  resolveInputCount as resolveTextAreaCount,
  inputCountInfo as textAreaCountInfo,
  inputExceedValue as textAreaExceedValue,
  resolveInputClear as resolveTextAreaClear
} from './input-count.engine';

// Из CSS-строк Svelte переносится только resize root в textarea, как style.resize в React.
export function textAreaResizeStyle(style = ''): string {
  let current = '';
  let quote = '';
  let depth = 0;
  let value = '';
  let important = false;
  function declaration() {
    const match = /^\s*resize\s*:\s*(.*?)\s*$/i.exec(current);
    if (!match) return;
    const nextImportant = /!\s*important\s*$/i.test(match[1]);
    if (!important || nextImportant) {
      value = match[1];
      important = nextImportant;
    }
  }
  for (let index = 0; index <= style.length; index++) {
    const char = style[index] ?? ';';
    if (char === '\\') {
      current += char + (style[++index] ?? '');
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote)
        quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (style.startsWith('/*', index)) {
      const end = style.indexOf('*/', index + 2);
      index = end < 0 ? style.length : end + 1;
      continue;
    }
    if (char === '(' || char === '[')
      depth++;
    if (char === ')' || char === ']')
      depth--;
    if (char === ';' && !depth) {
      declaration();
      current = '';
    } else current += char;
  }
  return value ? `resize:${value}` : '';
}
