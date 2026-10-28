import { describe, expect, it } from 'vitest';
import { createTagLabels } from './tag-labels.model.svelte';

describe('Tag label editing', () => {
  it('normalizes labels and rejects empty or duplicate entries without changing the list', () => {
    const model = createTagLabels(); expect(model.add('  ')).toBe('empty'); expect(model.add(' sVeLtE ')).toBe('duplicate'); expect(model.labels).toHaveLength(3);
    expect(model.add('  Тестирование  ')).toBe('added'); expect(model.labels.at(-1)?.text).toBe('Тестирование'); expect(model.add('тЕсТиРоВаНиЕ')).toBe('duplicate');
  });
  it('protects required labels and safely ignores repeated deletion', () => {
    const model = createTagLabels(); const [required, removable] = model.labels;
    expect(model.remove(required.key)).toBe(false); expect(model.remove(removable.key)).toBe(true); expect(model.remove(removable.key)).toBe(false); expect(model.labels.map(label => label.text)).toEqual(['Svelte', 'Документация']);
  });
  it('gives a reinserted label a new key so a closed component cannot hide it', () => {
    const model = createTagLabels(); const key = model.labels[1].key; model.remove(key); model.add('TypeScript');
    expect(model.labels.at(-1)?.key).not.toBe(key); expect(new Set(model.labels.map(label => label.key)).size).toBe(model.labels.length);
  });
  it('resets with fresh keys and keeps separate instances isolated', () => {
    const first = createTagLabels(); const second = createTagLabels(); const keys = first.labels.map(label => label.key); first.add('Custom'); first.reset();
    expect(first.labels.map(label => label.text)).toEqual(['Svelte', 'TypeScript', 'Документация']); expect(first.labels.every(label => !keys.includes(label.key))).toBe(true); expect(second.labels.map(label => label.key)).toEqual(keys); expect(second.labels).toHaveLength(3);
  });
});
