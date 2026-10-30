import type { MentionsConfig, MentionsEntity, MentionsOption } from './mentions.types';

export function getMentionMeasure(text: string, prefixes: readonly string[]) {
  return prefixes.reduce((last, prefix) => {
    const location = text.lastIndexOf(prefix);
    return location > last.location ? { location, prefix } : last;
  }, { location: -1, prefix: '' });
}
export function validateMentionSearch(text: string, split = ' ') {
  return !split || !text.includes(split);
}
export function filterMentionOption(text: string, option: MentionsOption) {
  return option.value.toLowerCase().includes(text.toLowerCase());
}

export function replaceMention(
  text: string,
  { location, prefix, target, selectionStart, split }: {
    location: number;
    prefix: string;
    target: string;
    selectionStart: number;
    split: string;
  }
) {
  let before = text.slice(0, location);
  if (before[before.length - split.length] === split)
    before = before.slice(0, before.length - split.length);
  if (before)
    before += split;

  let rest = text.slice(selectionStart);
  const overlap = target.slice(selectionStart - location - prefix.length);
  if (rest[0] && rest[0] !== split) {
    for (let index = 0; index < overlap.length; index++) {
      if ((rest[index] ?? '').toLowerCase() !== (overlap[index] ?? '').toLowerCase()) {
        rest = rest.slice(index);
        break;
      }
      if (index === overlap.length - 1)
        rest = rest.slice(overlap.length);
    }
  }
  if (rest.slice(0, split.length) === split)
    rest = rest.slice(split.length);
  const head = `${before}${prefix}${target}${split}`;
  return { text: head + rest, selection: head.length };
}

export function getMentions(value = '', {
  prefix = '@',
  split = ' '
}: MentionsConfig = {}): MentionsEntity[] {
  const prefixes = typeof prefix === 'string' ? [prefix] : prefix;
  return value.split(split).flatMap(part => {
    const token = prefixes.find(item => part.startsWith(item));
    const text = token === undefined ? '' : part.slice(token.length);
    return token !== undefined && text ? [{ prefix: token, value: text }] : [];
  });
}
