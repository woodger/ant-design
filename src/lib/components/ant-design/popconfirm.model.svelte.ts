export function createPopconfirmAction(getSession: () => object | null, handlers: {
  onSuccess: () => void;
  onError: (error: unknown) => void;
}) {
  let active = $state.raw<{ session: object }>();
  let disposed = false;

  function isCurrent(task: NonNullable<typeof active>) {
    return !disposed && active === task && getSession() === task.session;
  }

  function finish(task: NonNullable<typeof active>, success: boolean, error?: unknown) {
    if (!isCurrent(task)) return;

    active = undefined;
    if (success) handlers.onSuccess();
    else handlers.onError(error);
  }

  return {
    get loading() { return active !== undefined && isCurrent(active); },
    run(action: () => void | PromiseLike<unknown>): void | Promise<void> {
      const session = getSession();

      if (disposed || !session || active && isCurrent(active)) return;

      const task = { session };
      active = task;
      let result: void | PromiseLike<unknown>;

      try { result = action(); }
      catch (error) { finish(task, false, error); return; }

      if (result === undefined || result === null) { finish(task, true); return; }

      return Promise.resolve(result).then(() => finish(task, true), (error: unknown) => finish(task, false, error));
    },
    dispose() {
      disposed = true;
      active = undefined;
    }
  };
}
