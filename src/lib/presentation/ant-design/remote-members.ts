import type { TableColumn } from '$lib/components/ant-design';
import { getTableData } from '$lib/components/ant-design/table.engine';
import type { RemoteTableLoader } from './remote-table.model.svelte';

export interface RemoteMember {
  key: number;
  name: string;
  team: string;
  tasks: number;
  active: boolean;
}

export const remoteTeams = ['Разработка', 'Дизайн', 'Поддержка'];

export function createMemberSource() {
  let failNext = false;
  const members: RemoteMember[] = Array.from({ length: 36 }, (_, index) => ({
    key: index + 1,
    name: `Участник ${String(index + 1).padStart(2, '0')}`,
    team: remoteTeams[index % remoteTeams.length],
    tasks: index * 7 % 43,
    active: index % 5 !== 1
  }));
  const columns: TableColumn<RemoteMember>[] = [
    { key: 'name', title: 'Участник', sorter: (left, right) => left.name.localeCompare(right.name, 'ru') },
    { key: 'team', title: 'Команда', filters: remoteTeams.map((team) => ({ text: team, value: team })), onFilter: (value, row) => row.team === value },
    { key: 'tasks', title: 'Задачи', sorter: (left, right) => left.tasks - right.tasks },
    { key: 'active', title: 'Статус', filters: [{ text: 'Активен', value: true }, { text: 'Приостановлен', value: false }], onFilter: (value, row) => row.active === value }
  ];
  const load: RemoteTableLoader<RemoteMember> = (query, signal) => {
    const fail = failNext;
    failNext = false;

    return new Promise((resolve, reject) => {
      signal.throwIfAborted();
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', cancel);

        if (fail) {
          reject(new Error('Demo request failed'));
          return;
        }

        const data = getTableData(members, columns, undefined, query.sorter, query.filters);
        const start = (query.current - 1) * query.pageSize;
        resolve({ rows: data.rows.slice(start, start + query.pageSize).map((row) => row.record), total: data.rows.length });
      }, 350);

      function cancel() {
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
        reject(signal.reason);
      }

      signal.addEventListener('abort', cancel, { once: true });
    });
  };

  return {
    load,
    failNextRequest() { failNext = true; }
  };
}
