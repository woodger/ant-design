const timeUnits: [string, number][] = [
  ['Y', 1000 * 60 * 60 * 24 * 365],
  ['M', 1000 * 60 * 60 * 24 * 30],
  ['D', 1000 * 60 * 60 * 24],
  ['H', 1000 * 60 * 60],
  ['m', 1000 * 60],
  ['s', 1000],
  ['S', 1]
];

export function formatStatisticTime(duration: number, format: string): string {
  let remaining = duration;
  const escapeRegex = /\[[^\]]*]/g;
  const literals = (format.match(escapeRegex) || []).map(text => text.slice(1, -1));
  const template = format.replace(escapeRegex, '[]');
  const result = timeUnits.reduce((text, [name, unit]) => {
    if (!text.includes(name)) return text;

    const value = Math.floor(remaining / unit);
    remaining -= value * unit;
    return text.replace(
      new RegExp(`${name}+`, 'g'),
      token => value.toString().padStart(token.length, '0')
    );
  }, template);
  let index = 0;
  return result.replace(escapeRegex, () => literals[index++]);
}
