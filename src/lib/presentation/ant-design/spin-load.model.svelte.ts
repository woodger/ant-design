type LoadStatus = 'idle' | 'loading' | 'ready' | 'error' | 'cancelled';
export type SpinLoadKind = 'normal' | 'fast' | 'error';

export function createSpinLoad() {
  let state = $state.raw<{ status: LoadStatus; revision: number }>({ status: 'idle', revision: 0 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let active = true;

  function clear() { generation++; clearTimeout(timer); timer = undefined; }
  return {
    get status() { return state.status; }, get loading() { return state.status === 'loading'; }, get revision() { return state.revision; },
    load(kind: SpinLoadKind = 'normal') {
      if (!active || state.status === 'loading') return false;

      clear();
      const current = generation;
      state = { ...state, status: 'loading' };
      timer = setTimeout(() => {
        if (!active || current !== generation) return;

        timer = undefined;
        state = kind === 'error' ? { ...state, status: 'error' } : { status: 'ready', revision: state.revision + 1 };
      }, kind === 'fast' ? 50 : 700);
      return true;
    },
    cancel() { if (state.status !== 'loading') return false; clear(); state = { ...state, status: 'cancelled' }; return true; },
    reset() { clear(); state = { status: 'idle', revision: 0 }; },
    destroy() { active = false; clear(); }
  };
}
