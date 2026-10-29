import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Upload from './Upload.svelte';
import UploadDragger from './UploadDragger.svelte';
import UploadFixtures from '../../../../e2e/fixtures/UploadFixtures.svelte';

describe('Upload SSR', () => {
  it('renders initial status and native file constraints without starting a request', () => {
    const request = vi.fn(); const body = render(Upload, { props: { defaultFileList: [{ uid: '1', name: '<safe>.txt', status: 'error', error: Error('Failed') }], name: 'attachment', multiple: true, accept: '.txt', capture: 'user', customRequest: request } }).body;
    expect(body).toContain('type="file"'); expect(body).toContain('name="attachment"'); expect(body).toContain('accept=".txt"'); expect(body).toContain('capture="user"'); expect(body).toContain('multiple'); expect(body).toContain('&lt;safe>.txt'); expect(body).toContain('ant-upload-list-item-error'); expect(request).not.toHaveBeenCalled();
  });
  it('gives controlled empty lists priority over defaults and hides disabled remove controls', () => {
    const body = render(Upload, { props: { fileList: [], defaultFileList: [{ uid: '1', name: 'absent.txt' }] } }).body;
    expect(body).not.toContain('absent.txt');
    const disabled = render(Upload, { props: { disabled: true, defaultFileList: [{ uid: '1', name: 'keep.txt' }] } }).body;
    expect(disabled).toContain('keep.txt'); expect(disabled).not.toContain('aria-label="Удалить файл"');
  });
  it('renders Dragger keyboard semantics and height without browser APIs', () => {
    const body = render(UploadDragger, { props: { height: 160 } }).body;
    expect(body).toContain('ant-upload-drag'); expect(body).toContain('role="button"'); expect(body).toContain('tabindex="0"'); expect(body).toContain('height:160px');
  });
  it('renders locale, thumbnails and fixture state without creating timers', () => {
    vi.useFakeTimers();
    try { const body = render(UploadFixtures).body; expect(body).toContain('Удалить файл'); expect(body).toContain('pixel.png'); expect(body).toContain('ant-upload-picture-card-wrapper'); expect(vi.getTimerCount()).toBe(0); }
    finally { vi.useRealTimers(); }
  });
});
