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
import { getContext, setContext } from 'svelte';
import { ruRU, type ComponentSize, type Locale, type ThemeConfig } from './types';

export interface ConfigContext {
  readonly button?: ButtonConfig;
  readonly rate?: RateConfig;
  readonly watermark?: WatermarkConfig;
  readonly borderBeam?: BorderBeamConfig;
  readonly masonry?: MasonryConfig;
  readonly textArea?: TextAreaConfig;
  readonly input?: InputConfig;
  readonly inputPassword?: InputPasswordConfig;
  readonly inputSearch?: InputSearchConfig;
  readonly otp?: InputOTPConfig;
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
