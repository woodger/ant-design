import type { AvatarProps, AvatarShape, AvatarSize } from './avatar.types';
import type { PopoverProps } from './popover.types';

export type AvatarGroupKey = string | number;
export interface AvatarGroupItem extends AvatarProps { key: AvatarGroupKey; label: string; text?: string; }
export interface AvatarGroupMax {
  count?: number;
  style?: string;
  popover?: Pick<PopoverProps, 'trigger' | 'placement' | 'arrow' | 'autoAdjustOverflow' | 'mouseEnterDelay' | 'mouseLeaveDelay'>;
}
export interface AvatarGroupProps {
  items: readonly AvatarGroupItem[];
  size?: AvatarSize;
  shape?: AvatarShape;
  max?: AvatarGroupMax;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
