import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import MessageHolder from './MessageHolder.svelte';
import { createMessage } from './message.model.svelte.js';

describe('MessageHolder server rendering', () => {
  it('renders an empty owner without creating a visible surface', () => {
    const { body } = render(MessageHolder, { props: { message: createMessage() } });

    expect(body).toContain('ant-message-anchor');
    expect(body).not.toContain('popover=');
    expect(body).not.toContain('role="status"');
  });

  it('prepares queued content in a closed native popover without callbacks', () => {
    const message = createMessage(); const callback = vi.fn();
    message.success({ content: 'Saved changes', onClose: callback });
    const { body } = render(MessageHolder, { props: { message } });

    expect(body).toContain('popover="manual"');
    expect(body).toContain('role="status"');
    expect(body).toContain('aria-atomic="true"');
    expect(body).toContain('Saved changes');
    expect(body).toContain('ant-message-notice-success');
    expect(body).toContain('aria-hidden="true"');
    expect(body).not.toContain('autofocus');
    expect(body).not.toContain('tabindex=');
    expect(callback).not.toHaveBeenCalled();
  });

  it('escapes strings and supports passive snippets and custom decorative icons', () => {
    const message = createMessage();
    const content = createRawSnippet(() => ({ render: () => '<strong>Rich message</strong>' }));
    const icon = createRawSnippet(() => ({ render: () => '<span>Custom icon</span>' }));
    message.error('<script>Unsafe</script>'); message.info({ content, icon });
    const { body } = render(MessageHolder, { props: { message } });

    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
    expect(body).toContain('<strong>Rich message</strong>');
    expect(body).toContain('Custom icon');
    expect(body).not.toContain('<button');
  });

  it('renders explicit live roles, custom top positions and root attributes', () => {
    const message = createMessage(); message.error({ content: 'Error', role: 'alert', class: 'notice-custom', style: 'color: red' });
    const { body } = render(MessageHolder, { props: { message, top: '10vh', id: 'page-messages', class: 'holder-custom' } });

    expect(body).toContain('role="alert"');
    expect(body).toContain('--notification-top: 10vh');
    expect(body).toContain('id="page-messages"');
    expect(body).toContain('notice-custom');
    expect(body).toContain('holder-custom');
    expect(body).toContain('color: red');
  });

  it('keeps independent request queues isolated across rendering', () => {
    const first = createMessage(); const second = createMessage(); first.info('Private request');
    const firstBody = render(MessageHolder, { props: { message: first } }).body;
    const secondBody = render(MessageHolder, { props: { message: second } }).body;

    expect(firstBody).toContain('Private request');
    expect(secondBody).not.toContain('Private request');
  });
});
