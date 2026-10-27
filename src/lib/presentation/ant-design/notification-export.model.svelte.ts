type ExportState =
  | { status: 'idle'; percent: 0; phase: string }
  | { status: 'preparing'; percent: number; phase: string }
  | { status: 'ready'; percent: 100; phase: string; report: string }
  | { status: 'error' | 'cancelled'; percent: number; phase: string };

export function createNotificationExport(callbacks: { onReady: () => void; onError: () => void }) {
  let state = $state.raw<ExportState>({ status: 'idle', percent: 0, phase: 'Подготовьте отчёт.' });
  let generation = 0;
  let active = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function clear() { generation++; for (const timer of timers) clearTimeout(timer); timers.clear(); }
  function start(failed = false): boolean {
    if (!active || state.status === 'preparing') return false;

    clear();
    const current = generation;
    state = { status: 'preparing', percent: 0, phase: 'После подготовки здесь появится кнопка скачивания.' };
    function schedule(delay: number, update: () => void) {
      const timer = setTimeout(() => { timers.delete(timer); if (active && current === generation && state.status === 'preparing') update(); }, delay);
      timers.add(timer);
    }
    for (const stage of [{ delay: 200, percent: 25, phase: 'Собираем данные…' }, { delay: 450, percent: 65, phase: 'Формируем CSV…' }, { delay: 600, percent: 90, phase: 'Проверяем файл…' }]) {
      schedule(stage.delay, () => { state = { status: 'preparing', percent: stage.percent, phase: stage.phase }; });
    }
    schedule(700, () => {
      if (failed) { state = { status: 'error', percent: 90, phase: 'Данные сохранены. Попробуйте выполнить экспорт ещё раз.' }; callbacks.onError(); }
      else { state = { status: 'ready', percent: 100, phase: 'CSV-файл содержит две записи. Его можно скачать сейчас.', report: '\uFEFFname,framework\r\nAnna,Svelte\r\nBoris,TypeScript\r\n' }; callbacks.onReady(); }
    });
    return true;
  }

  return {
    get status() { return state.status; }, get percent() { return state.percent; }, get phase() { return state.phase; }, get report() { return state.status === 'ready' ? state.report : undefined; },
    start,
    cancel() { if (state.status !== 'preparing') return false; clear(); state = { status: 'cancelled', percent: state.percent, phase: 'Подготовка отчёта отменена.' }; return true; },
    reset() { clear(); state = { status: 'idle', percent: 0, phase: 'Подготовьте отчёт.' }; },
    destroy() { active = false; clear(); }
  };
}
