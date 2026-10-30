import type { UploadFile, UploadProps, UploadRcFile } from './upload.types';
// Ant Design 6.6.8 / rc-upload 1.1.1; MIT, vendor/LICENSE.ant-design и LICENSE.rc-upload.
export const UPLOAD_LIST_IGNORE = '__ANT_SVELTE_UPLOAD_LIST_IGNORE__';
export function uploadFileObject<T = unknown>(file: UploadRcFile): UploadFile<T> {
  return { ...file, lastModified: file.lastModified, lastModifiedDate: file.lastModifiedDate, name: file.name, size: file.size, type: file.type, uid: file.uid, percent: 0, originFileObj: file };
}
export function updateUploadList<T = unknown>(file: UploadFile<T>, list: readonly UploadFile<T>[]): UploadFile<T>[] {
  const next = [...list]; const index = next.findIndex(item => item.uid === file.uid);
  if (index < 0) next.push(file); else next[index] = file;
  return next;
}
export function limitUploadList<T = unknown>(file: UploadFile<T> | UploadRcFile, list: readonly UploadFile<T>[], maxCount?: number) {
  const next = maxCount === 1 ? list.slice(-1) : maxCount ? list.slice(0, maxCount) : [...list];
  return { list: next, notify: maxCount === 1 || !maxCount || list.length <= maxCount || 'status' in file && file.status === 'removed' || next.some(item => item.uid === file.uid) };
}
export function uploadAccept(file: Pick<File, 'name' | 'type'>, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(',').some(type => {
    const valid = type.trim();
    if (/^\*(\/\*)?$/.test(type)) return true;
    if (valid.startsWith('.')) { const lower = valid.toLowerCase(); return (lower === '.jpg' || lower === '.jpeg' ? ['.jpg', '.jpeg'] : [lower]).some(ext => file.name.toLowerCase().endsWith(ext)); }
    if (valid.endsWith('/*')) return file.type.replace(/\/.*$/, '') === valid.replace(/\/.*$/, '');
    return file.type === valid || /^\w+$/.test(valid);
  });
}
export function filterUploadFile(file: File, accept: UploadProps['accept'], force: boolean): boolean {
  if (typeof accept === 'object') {
    if (accept.filter === 'native') return true;
    if (typeof accept.filter === 'function') return accept.filter(file);
  }
  return !force || uploadAccept(file, typeof accept === 'string' ? accept : accept?.format);
}
export function uploadIsImage(file: UploadFile): boolean {
  if (file.type && !file.thumbUrl) return file.type.startsWith('image/');
  const url = file.thumbUrl || file.url || ''; const name = (url || file.name).split('/').at(-1)?.split(/#|\?/)[0] ?? '';
  const ext = /\.[^./\\]*$/.exec(name)?.[0]?.toLowerCase();
  if (url.startsWith('data:image/') || ['.avif','.bmp','.dpg','.gif','.heic','.heif','.ico','.jfif','.jpg','.jpeg','.png','.svg','.tif','.tiff','.webp'].includes(ext ?? '')) return true;
  return !url.startsWith('data:') && !ext;
}
