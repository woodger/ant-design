export interface SpinRequest { readonly spinning: boolean; readonly delay: number; }
export interface SpinClock { schedule: (callback: () => void, milliseconds: number) => () => void; }

export function normalizeSpinDelay(delay: number | undefined): number {
  return typeof delay === 'number' && Number.isFinite(delay) && delay > 0 ? Math.min(2_147_483_647, Math.floor(delay)) : 0;
}

export function createSpinModel(read: () => SpinRequest) {
  let elapsed = $state.raw<SpinRequest>();
  return {
    get visible() { const request = read(); return request.spinning && (request.delay === 0 || elapsed === request); },
    connect(request: SpinRequest, clock: SpinClock) {
      let active = true;
      const cancel = request.spinning && request.delay > 0 ? clock.schedule(() => { if (active && read() === request) elapsed = request; }, request.delay) : undefined;
      return () => { active = false; cancel?.(); };
    }
  };
}
