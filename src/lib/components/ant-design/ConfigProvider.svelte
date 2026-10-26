<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideConfig, useConfig, type ConfigContext } from './config-context';
  import type { ComponentSize, Locale, ThemeConfig } from './types';
  import './styles.css';

  export interface ConfigProviderProps {
    children: Snippet;
    theme?: ThemeConfig;
    componentSize?: ComponentSize;
    componentDisabled?: boolean;
    direction?: 'ltr' | 'rtl';
    locale?: Partial<Locale>;
    class?: string;
    style?: string;
  }

  let {
    children,
    theme,
    componentSize,
    componentDisabled,
    direction,
    locale,
    class: className = '',
    style
  }: ConfigProviderProps = $props();

  const parent = useConfig();
  const config: ConfigContext = {
    get componentSize() { return componentSize ?? parent.componentSize; },
    get componentDisabled() { return componentDisabled ?? parent.componentDisabled; },
    get direction() { return direction ?? parent.direction; },
    get theme() { return { ...parent.theme, ...theme }; },
    get locale() {
      return {
        ...parent.locale,
        ...locale,
        pagination: { ...parent.locale.pagination, ...locale?.pagination }
      };
    }
  };

  provideConfig(config);
</script>

<div
  class={`ant-svelte-theme ${className}`}
  data-ant-theme={config.theme.mode}
  data-ant-primary={config.theme.primary}
  data-ant-compact={config.theme.compact || undefined}
  dir={config.direction}
  {style}
>
  {@render children()}
</div>
