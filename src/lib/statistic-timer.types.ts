import type { StatisticProps } from './statistic.types';

export type StatisticTimerType = 'countdown' | 'countup';
/** Таймер Statistic; value задаёт исходную временную отметку в миллисекундах. */
export interface StatisticTimerProps extends StatisticProps {
  type: StatisticTimerType;
  /** @defaultValue 'HH:mm:ss' */
  format?: string;
  /** Текущая длительность в миллисекундах. */
  onChange?: (value: number) => void;
  /** Вызывается при достижении нуля countdown. */
  onFinish?: () => void;
}
/** Совместимый countdown-вариант StatisticTimer без явного type. */
export type StatisticCountdownProps = Omit<StatisticTimerProps, 'type'>;
