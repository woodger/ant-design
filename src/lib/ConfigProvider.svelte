<script lang="ts">
  import type { FloatButtonConfig, FloatButtonGroupConfig } from './float-button.types';
  import type { ButtonConfig } from './button.types';
  import type { RateConfig } from './rate.types';
  import type { WatermarkConfig } from './watermark.types';
  import type { BorderBeamConfig } from './border-beam.types';
  import type { MasonryConfig } from './masonry.types';
  import type { InputConfig } from './input.types';
  import type { InputPasswordConfig } from './input-password.types';
  import type { InputSearchConfig } from './input-search.types';
  import type { InputOTPConfig } from './input-otp.types';
  import type { TextAreaConfig } from './textarea.types';
  import type { Snippet } from 'svelte';
  import { provideConfig, useConfig, type ConfigContext } from './config-context';
  import type { ComponentSize, Locale, ThemeConfig } from './types';
  import './styles.css';

  /** Наследуемые настройки темы, локали и компонентов для дочернего дерева Svelte. */
  export interface ConfigProviderProps {
    children: Snippet;
    /** Частично переопределяет родительскую тему; остальные поля наследуются. */
    theme?: ThemeConfig;
    button?: ButtonConfig;
    rate?: RateConfig;
    watermark?: WatermarkConfig;
    borderBeam?: BorderBeamConfig;
    masonry?: MasonryConfig;
    textArea?: TextAreaConfig;
    input?: InputConfig;
    inputPassword?: InputPasswordConfig;
    inputSearch?: InputSearchConfig;
    otp?: InputOTPConfig;
    floatButton?: FloatButtonConfig;
    floatButtonGroup?: FloatButtonGroupConfig;
    /** Наследуемый размер controls; локальный size и Compact имеют приоритет. */
    componentSize?: ComponentSize;
    /** Наследуемое disabled для controls; явное локальное значение уточняет его. */
    componentDisabled?: boolean;
    direction?: 'ltr' | 'rtl';
    /** Частичный словарь с наследованием родительской локали и её подразделов. */
    locale?: Partial<Locale>;
    class?: string;
    style?: string;
  }

  let {
    children,
    theme,
    button,
    rate,
    watermark,
    borderBeam,
    masonry,
    textArea,
    input,
    inputPassword,
    inputSearch,
    otp,
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
    get button() {
      return button ?? parent.button;
    },
    get rate() {
      return rate ?? parent.rate;
    },
    get watermark() {
      return watermark ?? parent.watermark;
    },
    get borderBeam() {
      return borderBeam ?? parent.borderBeam;
    },
    get masonry() {
      return masonry ?? parent.masonry;
    },
    get input() {
      return input ?? parent.input;
    },
    get inputPassword() {
      return inputPassword ?? parent.inputPassword;
    },
    get inputSearch() {
      return inputSearch ?? parent.inputSearch;
    },
    get otp() {
      return otp ?? parent.otp;
    },
    get textArea() {
      return textArea ?? parent.textArea;
    },
    get floatButton() {
      return floatButton ?? parent.floatButton;
    },
    get floatButtonGroup() {
      return floatButtonGroup ?? parent.floatButtonGroup;
    },
    get componentSize() {
      return componentSize ?? parent.componentSize;
    },
    get explicitComponentSize() {
      return componentSize ?? parent.explicitComponentSize;
    },
    get componentDisabled() {
      return componentDisabled ?? parent.componentDisabled;
    },
    get direction() {
      return direction ?? parent.direction;
    },
    get theme() {
      return { ...parent.theme, ...theme };
    },
    get locale() {
      return {
        ...parent.locale,
        ...locale,
        global: { ...parent.locale.global, ...locale?.global },
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
