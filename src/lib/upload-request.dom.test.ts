import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadRequest } from './upload-request.dom';
import type { UploadRcFile } from './upload.types';
class Request {
  static last: Request;
  constructor() {
    Request.last = this;
  }
  upload = {
    onprogress: undefined as undefined | ((event: { loaded: number; total: number; }) => void)
  };
  status = 201;
  responseText = '{"ok":true}';
  response = '';
  withCredentials = false;
  onerror?: (event: ProgressEvent) => void;
  onload?: () => void;
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  abort = vi.fn();
}
afterEach(() => {
  vi.unstubAllGlobals();
});
describe('rc-upload XHR transport', () => {
  it(
    'sends multipart arrays, headers and credentials and forwards progress and JSON success',
    () => {
      vi.stubGlobal('XMLHttpRequest', Request);
      const onProgress = vi.fn();
      const onSuccess = vi.fn();
      const file = Object.assign(new File(['x'], 'a.txt'), { uid: 'a' }) as UploadRcFile;
      const control = uploadRequest(
        {
          action: '/upload',
          filename: 'attachment',
          file,
          method: 'PUT',
          data: { tags: ['a', 'b'], id: 3 },
          headers: { 'X-Requested-With': null, 'X-Test': 'yes' },
          withCredentials: true,
          onProgress,
          onSuccess
        }
      );
      const request = Request.last;
      const body = request.send.mock.calls[0][0] as FormData;

      expect(request.open).toHaveBeenCalledWith('PUT', '/upload', true);
      expect(request.withCredentials).toBe(true);
      expect(request.setRequestHeader.mock.calls).toEqual([['X-Test', 'yes']]);
      expect(body.getAll('tags[]')).toEqual(['a', 'b']);
      expect(body.get('id')).toBe('3');
      expect((body.get('attachment') as File).name).toBe('a.txt');
      const progress = { loaded: 2, total: 4 };
      request.upload.onprogress?.(progress);

      expect(onProgress).toHaveBeenCalledWith({ loaded: 2, total: 4, percent: 50 });
      expect(onProgress.mock.calls[0][0]).toBe(progress);
      request.onload?.();

      expect(onSuccess).toHaveBeenCalledWith({ ok: true }, request);
      control.abort();

      expect(request.abort).toHaveBeenCalledOnce();
    }
  );
  it('forwards non-2xx status and text responses and emits network errors', () => {
    vi.stubGlobal('XMLHttpRequest', Request);
    const onError = vi.fn();
    const file = Object.assign(new File(['x'], 'a.txt'), { uid: 'a' });
    uploadRequest({ action: '/upload', filename: 'file', file, method: 'post', onError });
    const request = Request.last;

    expect(request.setRequestHeader).toHaveBeenCalledWith('X-Requested-With', 'XMLHttpRequest');
    request.status = 503;
    request.responseText = 'Unavailable';
    request.onload?.();

    expect(onError.mock.calls[0][0]).toMatchObject(
      { status: 503, method: 'post', url: '/upload' }
    );
    expect(onError.mock.calls[0][1]).toBe('Unavailable');
    const event = { type: 'error' } as ProgressEvent;
    request.onerror?.(event);

    expect(onError.mock.calls[1][0]).toBe(event);
  });
});
