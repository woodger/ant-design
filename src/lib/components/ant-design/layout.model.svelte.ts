export function createLayoutState() {
  let siders = $state.raw<string[]>([]);
  let active = true;
  return {
    get hasSider() { return siders.length > 0; },
    register(id: string) {
      if (active) siders = [...siders, id];
      return () => { if (active) siders = siders.filter(value => value !== id); };
    },
    destroy() { active = false; }
  };
}
