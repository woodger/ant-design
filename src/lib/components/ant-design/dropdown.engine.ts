import type { DropdownItem, DropdownMenuItem } from './dropdown.types';

export function normalizeDropdownItems(items: readonly DropdownItem[]): DropdownItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.key)) return false;

    seen.add(item.key);
    return true;
  });
}

export function getDropdownCommands(items: readonly DropdownItem[]): DropdownMenuItem[] {
  return items.filter((item): item is DropdownMenuItem => item.type !== 'divider' && !item.disabled);
}

export function getDropdownActiveKey(items: readonly DropdownItem[], key: string | null): string | null {
  const commands = getDropdownCommands(items);

  return commands.find((item) => item.key === key)?.key ?? commands[0]?.key ?? null;
}

export function getDropdownNavigationKey(items: readonly DropdownItem[], current: string | null, direction: 'next' | 'previous' | 'first' | 'last'): string | null {
  const commands = getDropdownCommands(items);
  if (!commands.length) return null;
  if (direction === 'first') return commands[0].key;
  if (direction === 'last') return commands.at(-1)!.key;

  const index = commands.findIndex((item) => item.key === current);
  if (index === -1) return direction === 'next' ? commands[0].key : commands.at(-1)!.key;

  return commands[(index + (direction === 'next' ? 1 : -1) + commands.length) % commands.length].key;
}

export function getDropdownMatch(commands: readonly { key: string; text: string }[], current: string | null, query: string): string | null {
  const search = query.trim().toLocaleLowerCase();
  if (!search || !commands.length) return null;

  const currentIndex = commands.findIndex((item) => item.key === current);
  const start = currentIndex < 0 ? 0 : currentIndex + (Array.from(search).length === 1 ? 1 : 0);

  for (let offset = 0; offset < commands.length; offset++) {
    const item = commands[(start + offset) % commands.length];
    if (item.text.trim().toLocaleLowerCase().startsWith(search)) return item.key;
  }
  return null;
}
