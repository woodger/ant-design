import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Steps from './Steps.svelte';

const items = [
  { key: 'data', title: 'Data', content: 'Enter details' },
  { key: 'check', title: 'Review', subTitle: 'Optional' },
  { key: 'send', title: 'Send', disabled: true }
];
const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('Steps server rendering', () => {
  it(
    'renders an ordered passive list with one current step and no automatic announcements',
    () => {
      const body = render(Steps, { props: { items, current: 1 } }).body;

      expect(body).toContain('<ol');
      expect(body).toContain('role="list"');
      expect(body).toContain('aria-label="Этапы"');
      expect(body.match(/aria-current="step"/g)).toHaveLength(1);
      expect(body).toContain('ant-steps-item-finish');
      expect(body).toContain('ant-steps-item-process');
      expect(body).toContain('ant-steps-item-wait');
      expect(body).toContain('Завершён');
      expect(body).toContain('Выполняется');
      expect(body).not.toContain('<button');
      expect(body).not.toContain('tabindex');
      expect(body).not.toContain('aria-live');
      expect(body).not.toContain('role="tab');
    }
  );
  it(
    'uses native buttons only when the owner provides onChange and leaves current unchanged',
    () => {
      const change = vi.fn();
      const body = render(Steps, { props: { items, current: 1, onChange: change } }).body;

      expect(body.match(/<button /g)).toHaveLength(3);
      expect(body).toContain('type="button"');
      expect(body).toContain('disabled');
      expect(body.match(/aria-current="step"/g)).toHaveLength(1);
      expect(change).not.toHaveBeenCalled();
      const descriptions = [...body.matchAll(/aria-describedby="([^"]+)"/g)].flatMap(
        match => match[1].split(' ')
      );
      for (const id of descriptions)
        expect(body).toContain(`id="${id}"`);
    }
  );
  it(
    'renders snippets while keeping custom icons decorative and content separate from the selection button',
    () => {
      const body = render(
        Steps,
        {
          props: {
            onChange: () => { },
            items: [
              {
                key: 'custom',
                title: snippet('<strong>Custom title</strong>'),
                subTitle: snippet('<em>Note</em>'),
                content: snippet('<p>Block content</p>'),
                icon: snippet('<svg viewBox="0 0 20 20"><circle r="8" /></svg>')
              }
            ]
          }
        }
      ).body;

      expect(body).toContain('<strong>Custom title</strong>');
      expect(body).toContain('<em>Note</em>');
      expect(body).toContain('<p>Block content</p>');
      expect(body.indexOf('</button>')).toBeLessThan(body.indexOf('<p>Block content'));
      expect(body).toContain('aria-hidden="true"');
      expect(body).toContain(' inert');
      expect(body).not.toContain('role="button"');
    }
  );
  it('escapes strings and keeps owner attributes and explicit per-item statuses', () => {
    const body = render(
      Steps,
      {
        props: {
          id: 'order',
          'aria-labelledby': 'owner-title',
          'aria-describedby': 'hint',
          class: 'custom',
          style: 'margin: 4px',
          status: 'error',
          items: [
            {
              key: '<unsafe>',
              title: '<script>Unsafe</script>',
              content: '<img src=x>',
              status: 'wait'
            }
          ]
        }
      }
    ).body;

    expect(body).toContain('ant-steps-item-wait');
    expect(body).not.toContain('ant-steps-item-error');
    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
    expect(body).toContain('&lt;img src=x>');
    expect(body).toContain('aria-labelledby="owner-title"');
    expect(body).not.toContain('aria-label=');
    expect(body).toContain('aria-describedby="hint"');
    expect(body).toContain('id="order"');
    expect(body).toContain('custom');
    expect(body).toContain('margin: 4px');
  });
  it('renders completed and empty lists without a synthetic current step', () => {
    const completed = render(Steps, { props: { items, current: 50 } }).body;

    expect(completed).not.toContain('aria-current=');
    expect(completed.match(/class="ant-steps-item ant-steps-item-finish/g)).toHaveLength(3);
    const empty = render(Steps, { props: { items: [] } }).body;

    expect(empty).toContain('<ol');
    expect(empty).not.toContain('<li');
    expect(empty).not.toContain('aria-current=');
  });
  it(
    'renders desktop layout deterministically and does not allocate timers or DOM resources on the server',
    () => {
      vi.useFakeTimers();
      try {
        const body = render(Steps, { props: { items, responsive: true, onChange: () => { } } })
          .body;
        expect(body).toContain('ant-steps-horizontal');
        expect(vi.getTimerCount()).toBe(0);
        expect(render(Steps, { props: { items, orientation: 'vertical', size: 'small' } })
          .body)
          .toContain(
            'ant-steps-vertical ant-steps-small'
          );
      } finally {
        vi.useRealTimers();
      }
    }
  );
});
