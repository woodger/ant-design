export interface ResultSubmission { name: string; email: string; }
export type ResultOutcome = 'success' | 'error' | 'cancelled' | 'busy';

export function createResultSubmit() {
  let status = $state<'editing' | 'submitting' | 'success' | 'error'>('editing');
  let submitted = $state.raw<Readonly<ResultSubmission>>();
  let active = true;
  let generation = 0;
  let pending: { timer: ReturnType<typeof setTimeout>; resolve: (outcome: ResultOutcome) => void } | undefined;

  function cancel() {
    generation++;
    if (!pending) return;

    clearTimeout(pending.timer);
    pending.resolve('cancelled');
    pending = undefined;
  }

  return {
    get status() { return status; },
    get submitted() { return submitted; },
    submit(values: ResultSubmission, fail = false): Promise<ResultOutcome> {
      if (!active) return Promise.resolve('cancelled');
      if (pending) return Promise.resolve('busy');

      const snapshot = { ...values };
      const token = ++generation;
      status = 'submitting';
      return new Promise(resolve => {
        const timer = setTimeout(() => {
          if (!active || generation !== token) return;

          pending = undefined;
          submitted = snapshot;
          status = fail ? 'error' : 'success';
          resolve(status);
        }, 700);
        pending = { timer, resolve };
      });
    },
    edit() {
      if (!active || pending) return false;

      status = 'editing';
      return true;
    },
    reset() {
      cancel();
      status = 'editing';
      submitted = undefined;
    },
    destroy() { active = false; cancel(); }
  };
}
