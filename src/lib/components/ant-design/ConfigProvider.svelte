<script lang="ts">
  import type { FloatButtonConfig, FloatButtonGroupConfig } from './float-button.types';
  import type { ButtonConfig } from './button.types';
  import type { Snippet } from 'svelte';
  import { provideConfig, useConfig, type ConfigContext } from './config-context';
  import type { ComponentSize, Locale, ThemeConfig } from './types';
  import './styles.css';

  export interface ConfigProviderProps {
    children: Snippet;
    theme?: ThemeConfig;
    button?: ButtonConfig;
    floatButton?: FloatButtonConfig;
    floatButtonGroup?: FloatButtonGroupConfig;
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
    button,
    floatButton,
    floatButtonGroup,
    componentSize,
    componentDisabled,
    direction,
    locale,
    class: className = '',
    style
  }: ConfigProviderProps = $props();

  const parent = useConfig();
  const config: ConfigContext = {
    get button() { return button ?? parent.button; },
    get floatButton() { return floatButton ?? parent.floatButton; },
    get floatButtonGroup() { return floatButtonGroup ?? parent.floatButtonGroup; },
    get componentSize() { return componentSize ?? parent.componentSize; },
    get explicitComponentSize() { return componentSize ?? parent.explicitComponentSize; },
    get componentDisabled() { return componentDisabled ?? parent.componentDisabled; },
    get direction() { return direction ?? parent.direction; },
    get theme() { return { ...parent.theme, ...theme }; },
    get locale() {
      return {
        ...parent.locale,
        ...locale,
        pagination: { ...parent.locale.pagination, ...locale?.pagination },
        table: { ...parent.locale.table, ...locale?.table },
        inputNumber: { ...parent.locale.inputNumber, ...locale?.inputNumber },
        steps: { ...parent.locale.steps, ...locale?.steps },
        badge: { ...parent.locale.badge, ...locale?.badge },
        avatarGroup: { ...parent.locale.avatarGroup, ...locale?.avatarGroup },
        layout: { ...parent.locale.layout, ...locale?.layout }
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
