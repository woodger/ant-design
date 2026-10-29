import type { SelectOption } from '$lib/components/ant-design';

export interface RemoteSelectPage<Value extends string | number> {
  options: readonly SelectOption<Value>[];
  nextCursor?: string;
}
export type RemoteSelectLoader<Value extends string | number> = (query: { search: string; cursor?: string }, signal: AbortSignal) => Promise<RemoteSelectPage<Value>>;

export function createRemoteSelect<Value extends string | number>(loadPage: RemoteSelectLoader<Value>, debounce = 200) {
  let searchValue = $state('');
  let options = $state.raw<readonly SelectOption<Value>[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let nextCursor = $state<string>();
  let pendingCursor: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  let revision = 0;
  let disposed = false;

  function cancel() { revision++; clearTimeout(timer); timer = undefined; controller?.abort(); controller = undefined; }
  async function load(cursor?: string) {
    if (disposed) return;
    cancel();
    const id = revision;
    const request = new AbortController();
    controller = request;
    pendingCursor = cursor;
    loading = true;
    error = null;
    try {
      const page = await loadPage({ search: searchValue, cursor }, request.signal);
      if (disposed || revision !== id) return;
      const merged = new Map((cursor === undefined ? [] : options).map(option => [option.value, option]));
      for (const option of page.options) merged.set(option.value, option);
      options = [...merged.values()];
      nextCursor = page.nextCursor;
    } catch {
      if (!disposed && revision === id) error = 'Не удалось загрузить варианты.';
    } finally {
      if (!disposed && revision === id) { loading = false; controller = undefined; }
    }
  }
  return {
    get searchValue() { return searchValue; },
    get options() { return options; },
    get loading() { return loading; },
    get error() { return error; },
    get hasMore() { return nextCursor !== undefined; },
    load: () => load(),
    search(value: string) {
      if (disposed) return;
      cancel();
      searchValue = value; options = []; nextCursor = undefined; error = null; pendingCursor = undefined; loading = true;
      timer = setTimeout(() => { timer = undefined; void load(); }, debounce);
    },
    more() { if (!disposed && !loading && nextCursor !== undefined) return load(nextCursor); },
    retry() { return load(pendingCursor); },
    dispose() { disposed = true; cancel(); loading = false; }
  };
}
