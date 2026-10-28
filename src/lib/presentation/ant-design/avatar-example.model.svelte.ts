export type AvatarPicture = 'image' | 'initials' | 'broken';
export interface AvatarParticipant { key: string; name: string; initials: string; role: string; unread: number; picture: AvatarPicture; }

export const avatarPortrait = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#d6e4ff"/><circle cx="40" cy="29" r="14" fill="#2f54eb"/><path d="M10 80c0-24 12-36 30-36s30 12 30 36" fill="#2f54eb"/></svg>')}`;
export const avatarBrokenImage = 'data:image/png;base64,YmFkLWltYWdl';
export function avatarPictureSource(picture: AvatarPicture): string | undefined { return picture === 'image' ? avatarPortrait : picture === 'broken' ? avatarBrokenImage : undefined; }

export function createAvatarExample() {
  const defaults = (): AvatarParticipant[] => [
    { key: 'anna', name: 'Анна Новикова', initials: 'АН', role: 'Разработчик', unread: 3, picture: 'image' },
    { key: 'dmitry', name: 'Дмитрий Орлов', initials: 'ДО', role: 'Дизайнер', unread: 0, picture: 'initials' },
    { key: 'vera', name: 'Вера Смирнова', initials: 'ВС', role: 'Тестировщик', unread: 1, picture: 'broken' }
  ];
  let participants = $state(defaults());
  let selectedKey = $state<string>();
  let selected = $derived(participants.find(person => person.key === selectedKey));

  return {
    get participants(): readonly AvatarParticipant[] { return participants; },
    get selected() { return selected; },
    select(key: string): boolean {
      if (!participants.some(person => person.key === key)) return false;

      selectedKey = key;
      return true;
    },
    setPicture(key: string, picture: AvatarPicture): boolean {
      if (!participants.some(person => person.key === key && person.picture !== picture)) return false;

      participants = participants.map(person => person.key === key ? { ...person, picture } : person);
      return true;
    },
    reset() { participants = defaults(); selectedKey = undefined; }
  };
}
