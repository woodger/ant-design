import { avatarBrokenImage, avatarPortrait } from './avatar-example.model.svelte';

export interface AvatarGroupMember { key: number; label: string; text: string; src?: string; }

export function createAvatarGroupExample() {
  let sequence = 0;
  const defaults = (): AvatarGroupMember[] => [
    { key: sequence++, label: 'Анна Новикова', text: 'АН', src: avatarPortrait },
    { key: sequence++, label: 'Дмитрий Орлов', text: 'ДО' },
    { key: sequence++, label: 'Вера Смирнова', text: 'ВС', src: avatarBrokenImage },
    { key: sequence++, label: 'Елена Соколова', text: 'ЕС' },
    { key: sequence++, label: 'Игорь Волков', text: 'ИВ' }
  ];
  let members = $state(defaults());

  return {
    get members(): readonly AvatarGroupMember[] { return members; },
    add(source: string): boolean {
      const label = source.trim().replace(/\s+/g, ' ');
      if (!label) return false;

      const text = label.split(' ').slice(0, 2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('ru');
      members = [...members, { key: sequence++, label, text }];
      return true;
    },
    remove(key: number): boolean {
      if (!members.some(member => member.key === key)) return false;

      members = members.filter(member => member.key !== key);
      return true;
    },
    move(key: number, direction: -1 | 1): boolean {
      const index = members.findIndex(member => member.key === key);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= members.length) return false;

      const next = [...members];
      [next[index], next[destination]] = [next[destination], next[index]];
      members = next;
      return true;
    },
    reset() { members = defaults(); }
  };
}
