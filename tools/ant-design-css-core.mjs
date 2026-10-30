import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

export function verifyArchive(bytes, expected) {
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) throw new Error(
    `Archive SHA-256 mismatch: expected ${expected}, received ${actual}`
  );
}

export function archiveEntry(bytes, wanted) {
  const tar = gunzipSync(bytes);
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0))
      break;
    const string = (start, end) => header.toString('utf8', start, end).split('\0')[0];
    const name = [string(345, 500), string(0, 100)].filter(Boolean).join('/');
    const rawSize = string(124, 136).trim();
    if (!/^[0-7]+$/.test(rawSize)) throw new Error('Invalid npm tar entry size');
    const size = Number.parseInt(rawSize, 8);
    if (!Number.isSafeInteger(size)
      || offset + 512 + size > tar.length) throw new Error(
        'Truncated npm tar archive'
      );
    if (name === wanted
      && [0, 48].includes(header[156])) return tar.subarray(
        offset + 512,
        offset + 512 + size
      );
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error(`Missing npm archive entry: ${wanted}`);
}

// Нужны границы CSS-блоков и селекторов; тела деклараций сохраняются побайтно.
export function cssBlocks(css) {
  const blocks = [];
  let start = 0;
  let index = 0;
  while (index < css.length) {
    if (/\s/.test(css[index])) {
      index++;
      start = index;
      continue;
    }
    if (css.startsWith('/*', index)) {
      const end = css.indexOf('*/', index + 2);
      if (end < 0) throw new Error('Unclosed CSS comment');
      index = end + 2;
      start = index;
      continue;
    }
    start = index;
    let quote = '';
    let parentheses = 0;
    let brackets = 0;
    for (; index < css.length; index++) {
      const ch = css[index];
      if (ch === '\\') {
        index++;
        continue;
      }
      if (quote) {
        if (ch === quote)
          quote = '';
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (css.startsWith('/*', index)) {
        const end = css.indexOf('*/', index + 2);
        if (end < 0) throw new Error('Unclosed CSS comment');
        index = end + 1;
        continue;
      }
      if (ch === '(')
        parentheses++;
      if (ch === ')')
        parentheses--;
      if (ch === '[')
        brackets++;
      if (ch === ']')
        brackets--;
      if (parentheses < 0 || brackets < 0) throw new Error('Unbalanced CSS prelude');
      if ((ch === '{' || ch === ';') && !parentheses && !brackets)
        break;
    }
    const prelude = css.slice(start, index).trim();
    if (index === css.length) {
      if (prelude) throw new Error('CSS rule without a body');
      break;
    }
    if (css[index] === ';') {
      blocks.push({ prelude, body: null });
      index++;
      continue;
    }
    const bodyStart = ++index;
    let depth = 1;
    quote = '';
    for (; index < css.length && depth; index++) {
      const ch = css[index];
      if (ch === '\\') {
        index++;
        continue;
      }
      if (quote) {
        if (ch === quote)
          quote = '';
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (css.startsWith('/*', index)) {
        const end = css.indexOf('*/', index + 2);
        if (end < 0) throw new Error('Unclosed CSS comment');
        index = end + 1;
        continue;
      }
      if (ch === '{')
        depth++;
      if (ch === '}')
        depth--;
    }
    if (depth || quote) throw new Error('Unclosed CSS block');
    blocks.push({ prelude, body: css.slice(bodyStart, index - 1) });
  }
  return blocks;
}

export function splitSelectors(value) {
  const selectors = [];
  let start = 0;
  let quote = '';
  let depth = 0;
  for (let index = 0; index < value.length; index++) {
    const ch = value[index];
    if (ch === '\\') {
      index++;
      continue;
    }
    if (quote) {
      if (ch === quote)
        quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '(' || ch === '[')
      depth++;
    if (ch === ')' || ch === ']')
      depth--;
    if (ch === ',' && !depth) {
      selectors.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  selectors.push(value.slice(start).trim());
  return selectors.filter(Boolean);
}

export function extractCss(css, recipe) {
  if (!Array.isArray(recipe.include)
    || !recipe.include.length
    || !Number.isInteger(
      recipe.expectedRules
    )
    || recipe.expectedRules < 1) throw new Error(
      'CSS recipe requires selectors and a positive expectedRules count'
    );
  const include = recipe.include.map(pattern => new RegExp(pattern));
  const exclude = recipe.exclude.map(pattern => new RegExp(pattern));
  const replace = recipe.replacements.map(
    ({ pattern, replacement }) => ({ pattern: new RegExp(pattern, 'g'), replacement })
  );
  const foundKeyframes = new Set();
  const appended = [];
  let count = 0;
  function select(input, root = false) {
    const output = [];
    for (const block of cssBlocks(input)) {
      if (block.body === null)
        continue;
      const keyframe = /^@(?:-webkit-)?keyframes\s+([\w-]+)$/.exec(block.prelude);
      if (keyframe) {
        if (recipe.keyframes.includes(keyframe[1])) {
          (root && recipe.appendRootKeyframes ? appended : output).push(
            `${block.prelude}{${block.body}}`
          );
          foundKeyframes.add(keyframe[1]);
        }
      } else if (/^@(media|supports|container|layer)\b/.test(block.prelude)) {
        const children = select(block.body);
        if (children.length)
          output.push(`${block.prelude}{${children.join('')}}`);
      } else if (!block.prelude.startsWith('@')) {
        const selectors = splitSelectors(block.prelude).filter(
          selector => include.some(pattern => pattern.test(selector))
            && !exclude.some(
              pattern => pattern.test(selector)
            )
        );
        if (!selectors.length)
          continue;
        count++;
        output.push(
          `${selectors.map(
            selector => replace.reduce(
              (text, entry) => text.replace(entry.pattern, entry.replacement),
              selector
            )
          ).join(
            ','
          )}{${block.body}}`
        );
      }
    }
    return output;
  }
  const rules = [...select(css, true), ...appended];
  for (const name of recipe.keyframes)
    if (!foundKeyframes.has(name)) throw new Error(`Missing keyframes: ${name}`);
  if (count !== recipe.expectedRules) throw new Error(
    `Unexpected CSS rule count: expected ${recipe.expectedRules}, received ${count}`
  );
  return {
    content: `${recipe.header}\n${rules.join('\n')}\n`,
    rules: count,
    keyframes: [...foundKeyframes]
  };
}
