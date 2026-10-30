import type { StatisticProps } from './statistic.types';

export type StatisticTimerType = 'countdown' | 'countup';
export interface StatisticTimerProps extends StatisticProps {
  type: StatisticTimerType;
  format?: string;
  onChange?: (value: number) => void;
  onFinish?: () => void;
}
export type StatisticCountdownProps = Omit<StatisticTimerProps, 'type'>;
