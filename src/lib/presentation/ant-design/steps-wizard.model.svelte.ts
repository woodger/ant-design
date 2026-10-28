import { createForm } from '$lib/components/ant-design/form.model.svelte';
import { createResultSubmit } from './result-submit.model.svelte';

export function createStepsWizard() {
  const form = createForm({ initialValues: { name: 'Анна', email: 'anna@example.com' }, rules: { name: [{ required: true, message: 'Введите имя' }], email: [{ required: true, message: 'Введите email' }, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Проверьте email' }] } });
  const request = createResultSubmit();
  let current = $state(0);
  let unlocked = $state(0);
  let validationFailed = $state(false);
  let active = true;
  let generation = 0;
  const busy = () => form.isSubmitting || request.status === 'submitting';
  function move(index: number) { request.edit(); current = index; validationFailed = false; }

  return {
    form,
    get current() { return current; },
    get unlocked() { return unlocked; },
    get busy() { return busy(); },
    get status() { return request.status; },
    get submitted() { return request.submitted; },
    get validationFailed() { return validationFailed; },
    // Вызывается из onFinish: Form уже проверил snapshot и актуальность полей.
    acceptData() {
      if (!active || current !== 0 || request.status === 'submitting') return false;

      unlocked = Math.max(unlocked, 1); move(1);
      return true;
    },
    review() {
      if (!active || busy() || current !== 1) return false;

      unlocked = 2; move(2);
      return true;
    },
    async goTo(index: number) {
      if (!active || busy() || !Number.isInteger(index) || index < 0 || index > Math.min(unlocked, 2) || index === current) return false;

      if (current !== 0 || index === 0) { move(index); return true; }

      const token = generation;
      const result = await form.submit(() => { if (active && generation === token) move(index); });
      if (!active || generation !== token) return false;

      validationFailed = result.status === 'invalid' && !result.error.outOfDate;
      return result.status === 'success';
    },
    async send(fail = false) {
      if (!active || busy() || current !== 2) return false;

      const token = generation;
      const result = await form.submit(async values => {
        const outcome = await request.submit(values, fail);
        if (active && generation === token && outcome === 'success') current = 3;
      });
      if (!active || generation !== token) return false;

      validationFailed = result.status === 'invalid' && !result.error.outOfDate;
      if (validationFailed) current = 0;
      return result.status === 'success';
    },
    reset() { generation++; request.reset(); form.resetFields(); current = 0; unlocked = 0; validationFailed = false; },
    destroy() { active = false; generation++; request.destroy(); }
  };
}
