export type SwitchSettingSaver = (checked: boolean, signal: AbortSignal) => Promise<void>;

export function createSwitchSetting(save: SwitchSettingSaver, initial = false) {
  let checked = $state(initial);
  let saved = $state(initial);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let controller: AbortController | undefined;
  let disposed = false;

  return {
    get checked() { return checked; },
    get saved() { return saved; },
    get loading() { return loading; },
    get error() { return error; },
    async change(next: boolean) {
      if (disposed || loading || next === checked) return;

      const activeController = new AbortController();
      controller = activeController;
      checked = next;
      loading = true;
      error = null;

      try {
        await save(next, activeController.signal);

        if (!disposed) saved = next;
      } catch {
        if (!disposed) {
          checked = saved;
          error = 'Не удалось сохранить настройку. Попробуйте ещё раз.';
        }
      } finally {
        if (!disposed) {
          loading = false;
          controller = undefined;
        }
      }
    },
    dispose() {
      disposed = true;
      controller?.abort();
      controller = undefined;
      checked = saved;
      loading = false;
    }
  };
}
