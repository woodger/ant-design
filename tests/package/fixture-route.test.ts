import { describe, expect, it } from 'vitest';
import { resolveFixtureRoute } from '../browser/fixtures/fixture-route';

describe('Isolated fixture routes', () => {
  it('keeps the full-page address and selects only whitelisted fixtures', () => {
    const catalog = [
      { id: 'sample', module: './Sample.svelte' },
      { id: 'entry-form', module: './EntryForm.svelte', kind: 'form' }
    ];

    expect(resolveFixtureRoute('', catalog).mode).toBe('all');
    expect(resolveFixtureRoute('?fixture=all', catalog).mode).toBe('all');
    expect(resolveFixtureRoute('?fixture=sample', catalog)).toMatchObject({
      mode: 'single',
      entry: { id: 'sample', module: './Sample.svelte' }
    });
    expect(resolveFixtureRoute('?fixture=entry-form', catalog)).toMatchObject({
      mode: 'single',
      entry: { kind: 'form' }
    });
  });

  it('rejects unknown empty duplicate and path-like fixture identifiers', () => {
    const catalog = [{ id: 'sample' }];

    for (const query of [
      '?fixture=unknown',
      '?fixture=',
      '?fixture=sample&fixture=sample',
      '?fixture=../Components.svelte'
    ]) {
      expect(resolveFixtureRoute(query, catalog).mode).toBe('invalid');
    }
  });

  it('rejects named fixtures in an empty catalog while allowing the full-page address', () => {
    expect(resolveFixtureRoute('?fixture=sample', []).mode).toBe('invalid');
    expect(resolveFixtureRoute('?fixture=all', []).mode).toBe('all');
  });
});
