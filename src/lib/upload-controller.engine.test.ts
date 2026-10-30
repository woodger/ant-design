import { describe, expect, it } from 'vitest';
import { createUploadController } from './upload-controller.engine';
import { UPLOAD_LIST_IGNORE } from './upload.engine';
import type {
  UploadFile,
  UploadProps,
  UploadRequestOptions,
  UploadChangeParam
} from './upload.types';
function setup(initial: UploadFile[] = [], overrides: UploadProps = {}) {
  let files = initial;
  let count = 0;
  let aborted = 0;
  const events: UploadChangeParam[] = [];
  const requests: UploadRequestOptions[] = [];
  const props: UploadProps = {
    ...overrides,
    onChange: event => {
      events.push(event);
      overrides.onChange?.(event);
    }
  };
  const controller = createUploadController({
    props: () => props,
    files: () => files,
    setFiles: next => {
      files = next;
    },
    uid: () => `${++count}`,
    defaultRequest: option => {
      requests.push(option);
      return {
        abort: () => {
          aborted++;
        }
      };
    }
  });
  return {
    controller,
    events,
    requests,
    props,
    get files() {
      return files;
    },
    set files(next) {
      files = next;
    },
    get aborted() {
      return aborted;
    }
  };
}
const file = (name = 'a.txt') => new File(['content'], name, { type: 'text/plain' });
describe('Upload lifecycle', () => {
  it(
    'starts a batch after all preprocessing and passes the same original batch to each hook',
    async () => {
      let release!: () => void;
      const gate = new Promise<void>(resolve => {
        release = resolve;
      });
      const seen: string[][] = [];
      const h = setup([], {
        beforeUpload: async (current, batch) => {
          seen.push(batch.map(item => item.uid));
          if (current.name === 'a.txt')
            await gate;
          return true;
        }
      });
      const pending = h.controller.upload([file(), file('b.txt')]);
      await Promise.resolve();

      expect(h.files).toEqual([]);
      expect(h.requests).toEqual([]);
      release();
      await pending;

      expect(seen).toEqual([['1', '2'], ['1', '2']]);
      expect(h.files.map(item => item.status)).toEqual(['uploading', 'uploading']);
      expect(h.requests).toHaveLength(2);
      expect(h.events[0].fileList).toHaveLength(2);
    }
  );
  it(
    'retains false and rejected files without status but excludes LIST_IGNORE completely',
    async () => {
      const h = setup([], {
        beforeUpload: async current => {
          if (current.name === 'skip.txt') return UPLOAD_LIST_IGNORE;
          if (current.name === 'reject.txt') throw Error('rejected');
          return false;
        }
      });
      await h.controller.upload([file(), file('skip.txt'), file('reject.txt')]);

      expect(h.files.map(item => item.name)).toEqual(['a.txt', 'reject.txt']);
      expect(h.files.every(item => item.status === undefined)).toBe(true);
      expect(h.requests).toEqual([]);
      expect(h.events[0].file).toBeInstanceOf(File);
    }
  );
  it(
    'sends transformed content with original uid while resolving action and data with the original file',
    async () => {
      const h = setup(
        [],
        {
          beforeUpload: () => new Blob(['transformed']),
          action: async original => `/upload/${original.name}`,
          data: original => ({ name: original.name })
        }
      );
      await h.controller.upload([file()]);
      const request = h.requests[0];

      expect(await request.file.text()).toBe('transformed');
      expect(request.file.uid).toBe('1');
      expect(request.action).toBe('/upload/a.txt');
      expect(request.data).toEqual({ name: 'a.txt' });
      expect(h.files[0].originFileObj?.size).toBe(7);
    }
  );
  it(
    'publishes progress and parsed success response and ignores callbacks once removed',
    async () => {
      const h = setup();
      await h.controller.upload([file()]);
      const request = h.requests[0];
      request.onProgress?.({ percent: 45 });

      expect(h.files[0].percent).toBe(45);
      expect(h.events.at(-1)?.event).toEqual({ percent: 45 });
      request.onSuccess?.('{"ok":true}');

      expect(h.files[0]).toMatchObject({ status: 'done', percent: 100, response: { ok: true } });
      await h.controller.remove(h.files[0]);
      const length = h.events.length;
      request.onError?.(Error('late'));
      request.onProgress?.({ percent: 99 });

      expect(h.files).toEqual([]);
      expect(h.events).toHaveLength(length);
    }
  );
  it('supports asynchronous removal veto and aborts only after approval', async () => {
    const h = setup([], { onRemove: async () => false });
    await h.controller.upload([file()]);
    await h.controller.remove(h.files[0]);

    expect(h.files).toHaveLength(1);
    expect(h.aborted).toBe(0);
    h.props.onRemove = async () => true;
    await h.controller.remove(h.files[0]);

    expect(h.files).toEqual([]);
    expect(h.aborted).toBe(1);
    expect(h.events.at(-1)?.file).toMatchObject({ status: 'removed' });
  });
  it('does not publish progress for entries filtered out by the owner', async () => {
    const h = setup();
    await h.controller.upload([file()]);
    h.files = [];
    const length = h.events.length;
    h.requests[0].onSuccess?.({ ok: true });

    expect(h.events).toHaveLength(length);
  });
  it(
    'keeps transport independent of maxCount and suppresses excluded file events',
    async () => {
      const h = setup([], { maxCount: 2 });
      await h.controller.upload([file(), file('b.txt'), file('c.txt')]);

      expect(h.files.map(item => item.name)).toEqual(['a.txt', 'b.txt']);
      expect(h.events).toHaveLength(2);
      expect(h.requests).toHaveLength(3);
      h.requests[2].onProgress?.({ percent: 50 });

      expect(h.events).toHaveLength(2);
    }
  );
  it(
    'aborts active requests on disposal and prevents post-unmount preprocessing and callbacks',
    async () => {
      const h = setup();
      await h.controller.upload([file()]);
      h.controller.dispose();
      h.requests[0].onProgress?.({ percent: 12 });

      expect(h.aborted).toBe(1);
      expect(h.events).toHaveLength(1);
      let release!: () => void;
      const gate = new Promise<void>(resolve => {
        release = resolve;
      });
      const waiting = setup([], {
        beforeUpload: async () => {
          await gate;
        }
      });
      const pending = waiting.controller.upload([file()]);
      waiting.controller.dispose();
      release();
      await pending;

      expect(waiting.files).toEqual([]);
      expect(waiting.requests).toEqual([]);
    }
  );
  it(
    'provides defaultRequest to a custom transport and accepts synchronous completion',
    async () => {
      const h = setup([], {
        customRequest: (option, info) => {
          expect(info.defaultRequest).toBeTypeOf('function');
          option.onSuccess?.({ custom: true });
          return {
            abort: () => {
              throw Error('completed');
            }
          };
        }
      });
      await h.controller.upload([file()]);

      expect(h.files[0]).toMatchObject({ status: 'done', response: { custom: true } });
      expect(h.requests).toEqual([]);
      h.controller.dispose();
    }
  );
});
