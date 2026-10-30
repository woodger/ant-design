import type {
  ButtonColor,
  ButtonConfig,
  ButtonContent,
  ButtonLoading,
  ButtonType,
  ButtonVariant
} from './button.types';
const types: Record<ButtonType, readonly [ButtonColor | 'link', ButtonVariant]> = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  text: ['default', 'text'],
  link: ['link', 'link']
};
export function buttonAppearance(
  type?: ButtonType,
  danger = false,
  color?: ButtonColor,
  variant?: ButtonVariant,
  ghost = false,
  context?: Pick<ButtonConfig, 'color' | 'variant'>
): { color: ButtonColor | 'link'; variant: ButtonVariant; } {
  let parsed: readonly [ButtonColor | 'link', ButtonVariant];
  if (color && variant)
    parsed = [color, variant];
  else if (type || danger) {
    const pair = types[type || 'default'];
    parsed = danger ? ['danger', pair[1]] : pair;
  }
  else if (variant === 'solid')
    parsed = ['primary', 'solid'];
  else if (context?.color && context.variant)
    parsed = [context.color, context.variant];
  else if (context?.variant === 'solid')
    parsed = ['primary', 'solid'];
  else parsed = ['default', 'outlined'];
  return { color: parsed[0], variant: ghost && parsed[1] === 'solid' ? 'outlined' : parsed[1] };
}
export function buttonLoading(loading: ButtonLoading): { loading: boolean; delay: number; } {
  if (typeof loading === 'object' && loading !== null) {
    const delay = typeof loading.delay === 'number' ? loading.delay : 0;
    return { loading: delay <= 0, delay };
  }
  return { loading: Boolean(loading), delay: 0 };
}
export function buttonHasContent(content: ButtonContent): boolean {
  return content !== undefined && content !== null && content !== false && content !== '';
}
export function buttonTwoCN(value: string): boolean {
  return /^[\u4E00-\u9FA5]{2}$/.test(value);
}
export function buttonText(value: string, insert: boolean): string {
  return insert && buttonTwoCN(value) ? value.split('').join(' ') : value;
}
