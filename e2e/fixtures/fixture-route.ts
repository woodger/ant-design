import catalog from './catalog.json';

export function resolveFixtureRoute(search: string) {
  const requested = new URLSearchParams(search).getAll('fixture');
  if (!requested.length || requested.length === 1 && requested[0] === 'all') return { mode: 'all' } as const;

  const entry = requested.length === 1 ? catalog.find(item => item.id === requested[0]) : undefined;
  return entry ? { mode: 'single', entry } as const : { mode: 'invalid', requested: requested.join(', ') } as const;
}
