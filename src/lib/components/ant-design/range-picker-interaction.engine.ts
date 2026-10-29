// Переходы useRangeValueChange из rc-picker 1.12.2; MIT, vendor/LICENSE.rc-picker.
export type RangeInteractionSource = 'field-switch' | 'input' | 'panel-intermediate' | 'panel-final' | 'keyboard-submit-weak' | 'keyboard-submit' | 'confirm' | 'remove' | 'popupClose' | 'esc';
export function createRangeInteraction<Value>(options: {
  fieldCount: () => number;
  needConfirm: () => boolean;
  allowEmpty: () => readonly boolean[];
  getCalendarValue: () => readonly (Value | null | undefined)[];
  triggerCalendarChange: (index: number, value: Value | null) => void;
  flushSubmit: (index: number, all: boolean) => void;
  resetValue: (index?: number) => void;
}) {
  const { getCalendarValue, triggerCalendarChange, flushSubmit, resetValue } = options;

  let triggeredFields: { index: number; modified: boolean }[] = [];
  let confirmedIndex: number | null = null;
  let isLastInput = false;
  let current: number | null = null;
  let lastValid = 0;
  const getCurrentIndex = () => current;
  const setCurrentIndex = (value: number | null) => { current = value; if (value !== null) lastValid = value; };
  let forceFocus = false;
  const setForceFocus = (value: boolean) => { forceFocus = value; };

  const reset = () => {
    triggeredFields = [];
    confirmedIndex = null;
    isLastInput = false;
    setCurrentIndex(null);
    setForceFocus(false);
  };
  const recordTriggeredField = (index: number, modified?: boolean) => {
    const field = triggeredFields.find(item => item.index === index);
    if (field) {
      if (modified !== undefined) {
        field.modified = modified;
      }
    } else {
      triggeredFields = [...triggeredFields, {
        index,
        modified: modified ?? false
      }];
    }
  };
  const submitField = (index: number) => {
    recordTriggeredField(index);
    const allFieldsTriggered = triggeredFields.length >= options.fieldCount();
    flushSubmit(index, allFieldsTriggered);
    if (allFieldsTriggered) {
      reset();
    }
    return allFieldsTriggered;
  };
  const resolveAction = (currentIndex: number | null, index: number, source: RangeInteractionSource, value?: Value | null) => {
    if (source === 'esc') {
      return 'resetAll';
    }
    if (currentIndex === null) {
      return source === 'popupClose' ? 'resetAll' : 'abort';
    }
    const currentValue = value === undefined ? getCalendarValue()[currentIndex] : value;
    const currentEmpty = currentValue === null || currentValue === undefined;
    const canSwitch = !currentEmpty || options.allowEmpty()[currentIndex];
    const canSubmit = source === 'remove' || canSwitch;
    if (source === 'field-switch') {
      if (index === currentIndex) {
        return 'abort';
      }
      const nextIndex = (currentIndex + 1) % options.fieldCount();
      if (index !== nextIndex) {
        return 'abort';
      }
      const nextFieldTriggered = triggeredFields.some(field => field.index === nextIndex);
      if (options.needConfirm()) {
        if (confirmedIndex === currentIndex) {
          return 'switchNext';
        }
        return options.allowEmpty()[currentIndex] ? 'resetCurrentAndSwitchNext' : 'abort';
      }
      if (canSwitch) {
        return 'switchNext';
      }
      return nextFieldTriggered ? 'resetCurrentAndSwitchNext' : 'resetCurrent';
    }
    if (index !== currentIndex) {
      return 'abort';
    }
    if (source === 'popupClose') {
      const interactionModified = triggeredFields.some(field => field.modified);
      if (!interactionModified) {
        return 'finish';
      }
      if (options.needConfirm()) {
        const currentModified = triggeredFields.some(field => field.index === currentIndex && field.modified);
        const allFieldsTriggered = triggeredFields.length >= options.fieldCount();
        if (!allFieldsTriggered || !canSwitch) {
          return 'resetAll';
        }
        if (currentModified) {
          return options.allowEmpty()[currentIndex] ? 'resetCurrentAndSwitchNext' : 'resetAll';
        }
        return 'switchNext';
      }
      if (!canSubmit) {
        return 'resetAll';
      }
      return 'switchNext';
    }
    if (source === 'input' || source === 'panel-intermediate') {
      return 'modify';
    }
    if (source === 'panel-final') {
      return options.needConfirm() ? 'modify' : 'switchNext';
    }
    if (source === 'keyboard-submit-weak') {
      return canSubmit ? 'submitCurrent' : 'abort';
    }
    if (source === 'keyboard-submit' || source === 'confirm' || source === 'remove') {
      return canSubmit ? 'switchNext' : 'abort';
    }
    return 'abort';
  };
  const triggerChange = (index: number, source: RangeInteractionSource, value?: Value | null) => {
    let currentIndex = getCurrentIndex();
    if (source !== 'popupClose') {
      isLastInput = source === 'input';
    }
    if (currentIndex === null && source !== 'popupClose' && source !== 'esc') {
      currentIndex = index;
      setCurrentIndex(index);
      setForceFocus(false);
      recordTriggeredField(index, false);
    }
    const action = resolveAction(currentIndex, index, source, value);
    const actionIndex = currentIndex ?? index;
    switch (action) {
      case 'modify':
        recordTriggeredField(actionIndex, true);
        if (confirmedIndex === actionIndex) {
          confirmedIndex = null;
        }
        if (value !== undefined) {
          triggerCalendarChange(actionIndex, value);
        }
        break;
      case 'submitCurrent':
        if (options.needConfirm()) {
          confirmedIndex = actionIndex;
        }
        submitField(actionIndex);
        break;
      case 'switchNext':
        {
          if (source === 'panel-final' || value !== undefined) {
            recordTriggeredField(actionIndex, true);
          }
          if (value !== undefined) {
            triggerCalendarChange(actionIndex, value);
          }
          if (options.needConfirm() && (source === 'keyboard-submit' || source === 'confirm')) {
            confirmedIndex = actionIndex;
          }
          const forceFocus = source === 'confirm' || source === 'keyboard-submit' || source === 'panel-final' || source === 'popupClose' && !isLastInput;
          const allFieldsTriggered = submitField(actionIndex);
          if (allFieldsTriggered && source === 'field-switch') {
            setCurrentIndex(index);
            setForceFocus(false);
          } else if (!allFieldsTriggered) {
            const nextIndex = (actionIndex + 1) % options.fieldCount();
            setCurrentIndex(nextIndex);
            setForceFocus(forceFocus);
          }
          if (source === 'field-switch') {
            recordTriggeredField(index, false);
          }
          break;
        }
      case 'finish':
        reset();
        break;
      case 'resetCurrent':
        resetValue(actionIndex);
        if (confirmedIndex === actionIndex) {
          confirmedIndex = null;
        }
        triggeredFields = triggeredFields.filter(field => field.index !== actionIndex);
        break;
      case 'resetCurrentAndSwitchNext':
        {
          resetValue(actionIndex);
          if (confirmedIndex === actionIndex) {
            confirmedIndex = null;
          }
          if (source === 'field-switch') {
            const nextFieldTriggered = triggeredFields.some(field => field.index === index);
            if (nextFieldTriggered) {
              triggeredFields = [];
            }
            setCurrentIndex(index);
            setForceFocus(false);
            recordTriggeredField(index, false);
          } else {
            reset();
          }
          break;
        }
      case 'resetAll':
        resetValue();
        reset();
        break;
      case 'abort':
        if (source === 'field-switch' && index === actionIndex) {
          recordTriggeredField(index);
        }
        break;
    }
  };

  return {
    get currentIndex() { return current; },
    get activeIndex() { return current ?? lastValid; },
    get forceFocus() { return forceFocus; },
    get triggeredFields() { return triggeredFields.map(field => field.index); },
    trigger: triggerChange,
    reset
  };
}
