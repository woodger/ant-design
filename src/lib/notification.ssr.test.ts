import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import NotificationHolder from './NotificationHolder.svelte';
import { createNotification, notificationPlacements } from './notification.model.svelte.js';

describe('NotificationHolder server rendering', () => {
  it('renders an empty owner without a surface or live region', () => {
    const { body } = render(
      NotificationHolder,
      { props: { notification: createNotification() } }
    );

    expect(body).toContain('ant-notification-anchor');
    expect(body).not.toContain('popover=');
    expect(body).not.toContain('role="alert"');
  });

  it('prepares a closed popover with title, description and native close button', () => {
    const notification = createNotification();
    const callback = vi.fn();
    notification.success(
      { title: 'Report ready', description: 'Download the report', onClose: callback }
    );
    const { body } = render(NotificationHolder, { props: { notification } });

    expect(body).toContain('popover="manual"');
    expect(body).toContain('role="alert"');
    expect(body).toContain('aria-atomic="true"');
    expect(body).toContain('aria-labelledby=');
    expect(body).toContain('aria-describedby=');
    expect(body).toContain('Report ready');
    expect(body).toContain('Download the report');
    expect(body).toContain('type="button"');
    expect(body).toContain('aria-label="Закрыть"');
    expect(body).not.toContain('autofocus');
    expect(callback).not.toHaveBeenCalled();
  });

  it('renders all six placement groups with isolated content', () => {
    const notification = createNotification();
    for (const placement of notificationPlacements)
      notification.open({ title: placement, placement });
    const { body } = render(NotificationHolder, { props: { notification, top: 80, bottom: 40 } });
    for (const placement of notificationPlacements)
      expect(body).toContain(`data-placement="${placement}"`);

    expect(body).toContain('--notification-top: 80px');
    expect(body).toContain('--notification-bottom: 40px');
  });

  it('escapes strings and renders custom snippets, actions and decorative icons', () => {
    const notification = createNotification();
    const snippet = createRawSnippet(() => ({ render: () => '<strong>Rich report</strong>' }));
    const actions = createRawSnippet(
      () => ({ render: () => '<button type="button">Download</button>' })
    );
    notification.open(
      {
        title: '<script>Unsafe</script>',
        description: snippet,
        icon: snippet,
        actions,
        closeIcon: '×'
      }
    );
    const { body } = render(NotificationHolder, { props: { notification } });

    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
    expect(body).toContain('<strong>Rich report</strong>');
    expect(body).toContain('>Download</button>');
    expect(body).toContain('aria-hidden="true"');
    expect(body).toContain('×');
  });

  it('supports close visibility, names, live roles and root attributes', () => {
    const notification = createNotification();
    notification.open({ title: 'No close', closable: false });
    notification.open({ title: 'Hidden icon', closeIcon: null });
    notification.open(
      {
        title: 'Custom',
        role: 'status',
        closable: { 'aria-label': 'Dismiss report', disabled: true },
        class: 'report',
        style: 'color: red',
        'aria-label': 'Export result'
      }
    );
    const { body } = render(
      NotificationHolder,
      { props: { notification, id: 'notifications', class: 'holder' } }
    );

    expect(body.match(/class="ant-notification-notice-close /g)).toHaveLength(1);
    expect(body).toContain('aria-label="Dismiss report"');
    expect(body).toContain('disabled');
    expect(body).toContain('role="status"');
    expect(body).toContain('aria-label="Export result"');
    expect(body).toContain('id="notifications"');
    expect(body).toContain('holder');
    expect(body).toContain('color: red');
  });

  it('keeps independent request queues isolated', () => {
    const first = createNotification();
    const second = createNotification();
    first.info({ title: 'Private report' });

    expect(render(NotificationHolder, { props: { notification: first } }).body).toContain(
      'Private report'
    );
    expect(render(NotificationHolder, { props: { notification: second } }).body).not.toContain(
      'Private report'
    );
  });
});
