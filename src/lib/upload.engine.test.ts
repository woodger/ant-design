import { describe, expect, it } from 'vitest';
import {
  filterUploadFile,
  limitUploadList,
  uploadAccept,
  uploadIsImage,
  updateUploadList
} from './upload.engine';
import type { UploadFile } from './upload.types';

describe('Upload source list and accept semantics', () => {
  it('replaces matching uids without deduplicating names and preserves order', () => {
    const a = { uid: 'a', name: 'same' };
    const b = { uid: 'b', name: 'same' };
    const next: UploadFile = { ...a, status: 'done' };

    expect(updateUploadList(next, [a, b])).toEqual([next, b]);
    expect(updateUploadList(next, [b])).toEqual([b, next]);
    expect(a).not.toHaveProperty('status');
  });
  it(
    'replaces with the last file for maxCount one and suppresses overflow callbacks otherwise',
    () => {
      const files = ['a', 'b', 'c'].map(uid => ({ uid, name: uid }));

      expect(limitUploadList(files[0], files, 1)).toEqual({ list: [files[2]], notify: true });
      expect(limitUploadList(files[2], files, 2)).toEqual(
        { list: files.slice(0, 2), notify: false }
      );
      expect(limitUploadList({ ...files[2], status: 'removed' }, files, 2).notify).toBe(true);
    }
  );
  it('matches MIME groups and extensions including jpeg aliases', () => {
    expect(uploadAccept({ name: 'PHOTO.JPEG', type: 'image/jpeg' }, '.jpg')).toBe(true);
    expect(uploadAccept({ name: 'x.txt', type: 'text/plain' }, 'image/*,.png')).toBe(false);
    expect(uploadAccept({ name: 'x.txt', type: 'text/plain' }, '*/*')).toBe(true);
  });
  it('leaves native selections to the browser unless a custom filter is supplied', () => {
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });

    expect(filterUploadFile(file, '.png', false)).toBe(true);
    expect(filterUploadFile(file, '.png', true)).toBe(false);
    expect(filterUploadFile(file, { format: '.png', filter: 'native' }, true)).toBe(true);
    expect(filterUploadFile(file, { filter: () => false }, false)).toBe(false);
  });
  it(
    'detects image thumbnails while respecting explicit non-image MIME and URL extensions',
    () => {
      expect(uploadIsImage({ uid: '1', name: 'a.png', type: 'text/plain' })).toBe(false);
      expect(uploadIsImage({ uid: '1', name: 'a', url: '/A.WEBP?x=1' })).toBe(true);
      expect(uploadIsImage({ uid: '1', name: 'a.txt' })).toBe(false);
      expect(uploadIsImage({ uid: '1', name: 'a', thumbUrl: 'data:application/pdf;base64,AA' }))
        .toBe(
          false
        );
    }
  );
});
