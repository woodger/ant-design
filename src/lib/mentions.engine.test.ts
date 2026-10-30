import { describe, it, expect } from 'vitest';
import {
  getMentionMeasure,
  replaceMention,
  getMentions,
  validateMentionSearch,
  filterMentionOption
} from './mentions.engine';
describe('Mentions source text rules', () => {
  it('uses the last prefix location and keeps configured order for equal locations', () => {
    expect(getMentionMeasure('hello @alice #team', ['@', '#'])).toEqual(
      { location: 13, prefix: '#' }
    );
    expect(getMentionMeasure('abc', ['ab', 'a'])).toEqual({ location: 0, prefix: 'ab' });
    expect(getMentionMeasure('none', ['@'])).toEqual({ location: -1, prefix: '' });
  });
  it('validates only the configured split instead of inventing whitespace rules', () => {
    expect(validateMentionSearch('a b', ' ')).toBe(false);
    expect(validateMentionSearch('a\nb', ' ')).toBe(true);
    expect(validateMentionSearch('a b', '')).toBe(true);
    expect(filterMentionOption('AL', { value: 'alice' })).toBe(true);
  });
  it('inserts a separator before the token and preserves unrelated trailing text', () => {
    expect(
      replaceMention(
        'hello@altest',
        { location: 5, prefix: '@', target: 'alice', selectionStart: 8, split: ' ' }
      )
    ).toEqual(
      { text: 'hello @alice test', selection: 13 }
    );
  });
  it('deduplicates the case-insensitive suffix at the caret and one trailing split', () => {
    expect(
      replaceMention(
        '@aliCE done',
        { location: 0, prefix: '@', target: 'alice', selectionStart: 3, split: ' ' }
      )
    ).toEqual(
      { text: '@alice done', selection: 7 }
    );
  });
  it('preserves empty split and multi-character prefix with UTF-16 native offsets', () => {
    expect(
      replaceMention(
        '😀::al',
        { location: 2, prefix: '::', target: 'alice', selectionStart: 6, split: '' }
      )
    ).toEqual(
      { text: '😀::alice', selection: 9 }
    );
  });
  it('extracts only nonempty entities that start split-separated parts', () => {
    expect(getMentions('hello@bad @alice #team @', { prefix: ['@', '#'] })).toEqual(
      [{ prefix: '@', value: 'alice' }, { prefix: '#', value: 'team' }]
    );
    expect(getMentions('@one,@two', { split: ',' })).toEqual(
      [{ prefix: '@', value: 'one' }, { prefix: '@', value: 'two' }]
    );
  });
});
