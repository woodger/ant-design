export interface TagLabel { key: number; text: string; protected: boolean; }
export type TagAddResult = 'added' | 'empty' | 'duplicate';

export function createTagLabels() {
  let sequence = 0;
  const defaults = () => ['Svelte', 'TypeScript', 'Документация'].map((text, index) => ({ key: sequence++, text, protected: index === 0 }));
  let labels = $state<TagLabel[]>(defaults());

  return {
    get labels(): readonly TagLabel[] { return labels; },
    add(value: string): TagAddResult {
      const text = value.trim();
      if (!text) return 'empty';
      if (labels.some(label => label.text.toLocaleLowerCase('ru') === text.toLocaleLowerCase('ru'))) return 'duplicate';

      labels = [...labels, { key: sequence++, text, protected: false }];
      return 'added';
    },
    remove(key: number): boolean {
      const label = labels.find(item => item.key === key);
      if (!label || label.protected) return false;

      labels = labels.filter(item => item.key !== key);
      return true;
    },
    reset() { labels = defaults(); }
  };
}
