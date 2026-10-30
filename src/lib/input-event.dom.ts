export function inputChangeEvent<T extends HTMLInputElement | HTMLTextAreaElement>(
  event: Event,
  element: T,
  value: string
): Event & { target: T; currentTarget: T; readonly nativeEvent: Event; } {
  const target = element.cloneNode(true) as T;
  target.value = value;

  // Email и некоторые другие input types не поддерживают selection.
  if (typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
    target.selectionStart = element.selectionStart;
    target.selectionEnd = element.selectionEnd;
  }

  target.setSelectionRange = (start, end, direction) =>
    element.setSelectionRange(start, end, direction);

  // Native Event getters требуют исходный receiver, в отличие от React SyntheticEvent.
  return new Proxy(event, {
    get(original, key) {
      if (key === 'target' || key === 'currentTarget') return target;
      if (key === 'type' && original.type === 'input') return 'change';
      if (key === 'nativeEvent') return original;

      const result = Reflect.get(original, key, original);

      return typeof result === 'function' ? result.bind(original) : result;
    }
  }) as Event & { target: T; currentTarget: T; readonly nativeEvent: Event; };
}
