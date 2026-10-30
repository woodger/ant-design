import type { FloatButtonConfig, FloatButtonGroupConfig } from './float-button.types';
import type { ButtonConfig } from './button.types';
import type { InputConfig } from './input.types';
import { getContext, setContext } from 'svelte';
import { ruRU, type ComponentSize, type Locale, type ThemeConfig } from './types';

export interface ConfigContext {
  readonly button?: ButtonConfig;
  readonly input?: InputConfig;
  readonly floatButton?: FloatButtonConfig;
  readonly floatButtonGroup?: FloatButtonGroupConfig;
  readonly componentSize: ComponentSize;
  // Divider отличает явно заданный размер от общего fallback middle.
  readonly explicitComponentSize?: ComponentSize;
  readonly componentDisabled: boolean;
  readonly direction: 'ltr' | 'rtl';
  readonly theme: Required<ThemeConfig>;
  readonly locale: Locale;
}

const configKey = Symbol('ant-design-config');
const defaultConfig: ConfigContext = {
  componentSize: 'middle',
  componentDisabled: false,
  direction: 'ltr',
  theme: { mode: 'light', primary: 'blue', compact: false },
  locale: ruRU
};

export function useConfig(): ConfigContext {
  return getContext<ConfigContext | undefined>(configKey) ?? defaultConfig;
}

export function provideConfig(config: ConfigContext) {
  setContext(configKey, config);
}
