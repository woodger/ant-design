export type ProgressType = 'line' | 'circle';
export type ProgressStatus = 'normal' | 'active' | 'exception' | 'success';
export type ProgressCircleSize = 'small' | 'medium' | number;
export type ProgressLineSize = ProgressCircleSize | [number | string, number] | { width?: number | string; height?: number };
export type ProgressSize = ProgressLineSize;

interface ProgressBaseProps {
  percent?: number;
  showInfo?: boolean;
  format?: (percent: number) => string;
  strokeColor?: string;
  railColor?: string;
  strokeLinecap?: 'round' | 'butt' | 'square';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-valuetext'?: string;
  class?: string;
  style?: string;
}

export type ProgressProps = ProgressBaseProps & (
  | { type?: 'line'; status?: ProgressStatus; size?: ProgressLineSize; strokeWidth?: never }
  | { type: 'circle'; status?: Exclude<ProgressStatus, 'active'>; size?: ProgressCircleSize; strokeWidth?: number }
);
