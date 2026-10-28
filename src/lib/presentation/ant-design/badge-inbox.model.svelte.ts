export interface BadgeMessage { key: number; title: string; body: string; read: boolean; }

export function createBadgeInbox() {
  let sequence = 0;
  const defaults = (): BadgeMessage[] => [
    { key: sequence++, title: 'Релиз подготовлен', body: 'Новая версия готова к проверке.', read: false },
    { key: sequence++, title: 'Документация обновлена', body: 'Описание компонентов актуально.', read: true },
    { key: sequence++, title: 'Нужна проверка', body: 'Посмотрите новые изменения.', read: false }
  ];
  let messages = $state<BadgeMessage[]>(defaults());
  let unreadCount = $derived(messages.filter(message => !message.read).length);

  function append(amount: 1 | 100) {
    messages = [...messages, ...Array.from({ length: amount }, () => {
      const key = sequence++;
      return { key, title: `Сообщение ${key + 1}`, body: 'Новое уведомление в локальном примере.', read: false };
    })];
  }

  return {
    get messages(): readonly BadgeMessage[] { return messages; },
    get unreadCount() { return unreadCount; },
    add() { append(1); },
    addBatch() { append(100); },
    markRead(key: number): boolean {
      if (!messages.some(message => message.key === key && !message.read)) return false;

      messages = messages.map(message => message.key === key ? { ...message, read: true } : message);
      return true;
    },
    readAll(): number {
      const changed = unreadCount;
      if (changed) messages = messages.map(message => message.read ? message : { ...message, read: true });
      return changed;
    },
    reset() { messages = defaults(); }
  };
}
