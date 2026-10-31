/** Вставка заменяет хвост; formatter видит пробелы пустых ячеек до ограничения длины. */
export function patchOTPCells(
  cells: readonly string[],
  index: number,
  text: string,
  length: number,
  formatter?: (value: string) => string
): string[] {
  let next = [...cells];
  for (let before = 0; before < index; before++) {
    if (!next[before]) next[before] = '';
  }

  if (text.length <= 1) next[index] = text;
  else next = next.slice(0, index).concat(text.split(''));

  while (next.length && !next[next.length - 1]) next.pop();

  const joined = next.map(cell => cell || ' ').join('');
  const formatted = formatter ? formatter(joined) : joined;
  return (formatted || '').split('').map((cell, position) =>
    cell === ' ' && !next[position] ? next[position] : cell
  ).slice(0, length);
}

export function isOTPCompleteChange(
  previous: readonly string[],
  next: readonly string[],
  length: number
): boolean {
  return next.length === length
    && next.every(cell => Boolean(cell))
    && next.some((cell, index) => previous[index] !== cell);
}
