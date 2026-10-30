import { describe, expect, it } from 'vitest';
import { createRangeInteraction } from './range-picker-interaction.engine';
function setup(needConfirm = false, allowEmpty = [false, false], count = 2) {
  let calendar: (string | null)[] = [null, null];
  let committed: (string | null)[] = [null, null];
  let submit: (string | null)[] = [null, null];
  const flushed: [number, boolean][] = [];
  const reset: (number | undefined)[] = [];
  const machine = createRangeInteraction<string>({
    fieldCount: () => count,
    needConfirm: () => needConfirm,
    allowEmpty: () => allowEmpty,
    getCalendarValue: () => calendar,
    triggerCalendarChange: (index, value) => {
      calendar[index] = value;
    },
    flushSubmit: (index, all) => {
      submit[index] = calendar[index];
      flushed.push([index, all]);
      if (all)
        committed = [...submit];
    },
    resetValue: index => {
      reset.push(index);
      if (index === undefined) {
        calendar = [...committed];
        submit = [...committed];
      } else {
        calendar[index] = committed[index];
        submit[index] = committed[index];
      }
    }
  });
  return {
    machine,
    flushed,
    reset,
    get calendar() {
      return calendar;
    },
    get committed() {
      return committed;
    }
  };
}
describe('rc-picker range interaction transitions', () => {
  it('advances date panel selection and submits only after both fields participate', () => {
    const h = setup();
    h.machine.trigger(0, 'field-switch');
    h.machine.trigger(0, 'panel-final', 'start');

    expect(h.machine.currentIndex).toBe(1);
    expect(h.machine.forceFocus).toBe(true);
    expect(h.flushed).toEqual([[0, false]]);
    h.machine.trigger(1, 'field-switch');
    h.machine.trigger(1, 'panel-final', 'end');

    expect(h.committed).toEqual(['start', 'end']);
    expect(h.flushed).toEqual([[0, false], [1, true]]);
    expect(h.machine.currentIndex).toBeNull();
  });
  it('keeps datetime drafts until explicit confirmation of each field', () => {
    const h = setup(true);
    h.machine.trigger(0, 'panel-intermediate', 'start');
    h.machine.trigger(1, 'field-switch');

    expect(h.machine.currentIndex).toBe(0);
    expect(h.flushed).toEqual([]);
    h.machine.trigger(0, 'confirm');

    expect(h.machine.currentIndex).toBe(1);
    h.machine.trigger(1, 'field-switch');
    h.machine.trigger(1, 'panel-intermediate', 'end');

    expect(h.committed).toEqual([null, null]);
    h.machine.trigger(1, 'confirm');

    expect(h.committed).toEqual(['start', 'end']);
  });
  it('discards incomplete range drafts on popup close and Escape', () => {
    const h = setup();
    h.machine.trigger(0, 'panel-final', 'start');
    h.machine.trigger(1, 'field-switch');
    h.machine.trigger(1, 'popupClose');

    expect(h.calendar).toEqual([null, null]);
    expect(h.machine.currentIndex).toBeNull();
    h.machine.trigger(0, 'input', 'new');
    h.machine.trigger(0, 'esc');

    expect(h.calendar).toEqual([null, null]);
    expect(h.reset.at(-1)).toBeUndefined();
  });
  it(
    'allows Tab to flush without forcing external focus and accepts the next field focus',
    () => {
      const h = setup(true);
      h.machine.trigger(0, 'input', 'start');
      h.machine.trigger(0, 'keyboard-submit-weak');

      expect(h.machine.currentIndex).toBe(0);
      expect(h.machine.forceFocus).toBe(false);
      expect(h.flushed).toEqual([[0, false]]);
      h.machine.trigger(1, 'field-switch');

      expect(h.machine.currentIndex).toBe(1);
      expect(h.machine.forceFocus).toBe(false);
    }
  );
  it('resets an unconfirmed allowEmpty field before switching without submitting it', () => {
    const h = setup(true, [true, false]);
    h.machine.trigger(0, 'input', 'unconfirmed');
    h.machine.trigger(1, 'field-switch');

    expect(h.calendar).toEqual([null, null]);
    expect(h.machine.currentIndex).toBe(1);
    expect(h.flushed).toEqual([]);
  });
  it(
    'blocks an empty required field from advancing and submits a single enabled field immediately',
    () => {
      const h = setup();
      h.machine.trigger(0, 'field-switch');
      h.machine.trigger(1, 'field-switch');

      expect(h.machine.currentIndex).toBe(0);
      const single = setup(false, [false, false], 1);
      single.machine.trigger(1, 'panel-final', 'end');

      expect(single.flushed).toEqual([[1, true]]);
    }
  );
  it(
    'ends an unchanged interaction without publishing values and resets after a completed close',
    () => {
      const h = setup();
      h.machine.trigger(0, 'field-switch');
      h.machine.trigger(0, 'popupClose');

      expect(h.flushed).toEqual([]);
      expect(h.reset).toEqual([]);
      h.machine.trigger(0, 'popupClose');

      expect(h.reset).toEqual([undefined]);
    }
  );
});
