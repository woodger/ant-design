<script lang="ts">
  import type { Dayjs } from 'dayjs';
  import { tick } from 'svelte';
  import { dayjsGenerateConfig as adapter } from './date-picker-dayjs.engine';
  import { calendarCells, pickerDateDisabled } from './date-picker.engine';
  import type { DatePickerMode, DatePickerProps } from './date-picker.types';
  let {
    panel,
    selected,
    mode,
    locale,
    restrictions,
    now,
    direction,
    range,
    onHover,
    showPrevious = true,
    showNext = true,
    onSelect,
    onNavigate,
    onModeChange
  }: {
    panel: Dayjs;
    selected: Dayjs | null;
    mode: DatePickerMode;
    direction: 'ltr' | 'rtl';
    range?: readonly [Dayjs | null, Dayjs | null];
    onHover?: (value: Dayjs | null) => void;
    showPrevious?: boolean;
    showNext?: boolean;
    locale: {
      locale: string;
      shortWeekDays?: string[];
      shortMonths?: string[];
      yearFormat?: string;
      previousMonth?: string;
      nextMonth?: string;
      previousYear?: string;
      nextYear?: string;
      monthSelect?: string;
      yearSelect?: string;
      decadeSelect?: string;
    };
    restrictions: Pick<DatePickerProps, 'minDate' | 'maxDate' | 'disabledDate'>;
    now: Dayjs;
    onSelect: (value: Dayjs) => void;
    onNavigate: (value: Dayjs) => void;
    onModeChange: (mode: DatePickerMode) => void;
  } = $props();
  let root: HTMLDivElement;
  let cells = $derived(calendarCells(panel, mode, locale.locale));
  let width = $derived(mode === 'date' ? 7 : 3);
  let weeks = $derived(locale.shortWeekDays ?? adapter.locale.getShortWeekDays!(locale.locale));
  let months = $derived(locale.shortMonths ?? adapter.locale.getShortMonths!(locale.locale));
  let firstDay = $derived(adapter.locale.getWeekFirstDay(locale.locale));
  let unit = $derived<'day' | 'month' | 'year'>(
    mode === 'date' ? 'day' : mode === 'month' ? 'month' : 'year'
  );
  function label(date: Dayjs) {
    return date.format(mode === 'date' ? 'YYYY-MM-DD' : mode === 'month' ? 'YYYY-MM' : 'YYYY');
  }
  function move(amount: number, large = false) {
    onNavigate(
      mode === 'date'
        ? panel.add(amount, large ? 'year' : 'month')
        : panel.add(amount * (mode === 'month' ? 1 : mode === 'year' ? 10 : 100), 'year')
    );
  }
  function selectedCell(date: Dayjs) {
    return selected
      ? mode === 'decade'
        ? Math.floor(selected.year() / 10) === Math.floor(date.year() / 10)
        : selected.isSame(date, unit)
      : false;
  }
  async function key(event: KeyboardEvent, date: Dayjs) {
    let next: Dayjs;
    const step = mode === 'decade' ? 10 : 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
      next = date.add(
        (event.key === 'ArrowLeft' ? -1 : 1) * (direction === 'rtl' ? -1 : 1) * step,
        unit
      );
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      next = date.add((event.key === 'ArrowUp' ? -1 : 1) * width * step, unit);
    else if (event.key === 'PageUp' || event.key === 'PageDown')
      next = mode === 'date'
        ? date.add(event.key === 'PageUp' ? -1 : 1, event.shiftKey ? 'year' : 'month')
        : date.add(
          (event.key === 'PageUp' ? -1 : 1) * (mode === 'month' ? 1 : mode === 'year' ? 10 : 100),
          'year'
        );
    else if (event.key === 'Home' || event.key === 'End')
      next = mode === 'date'
        ? event.key === 'Home' ? date.startOf('month') : date.endOf('month')
        : mode === 'month'
          ? date.month(event.key === 'Home' ? 0 : 11)
          : date.year(
            Math.floor(date.year() / (mode === 'year'
              ? 10
              : 100)) * (mode === 'year'
                ? 10
                : 100) + (event.key === 'Home'
                  ? 0
                  : mode === 'year' ? 9 : 90)
          );
    else return;
    event.preventDefault();
    const sign = next.isBefore(date) ? -1 : 1;
    for (let n = 0; n < 3660 && pickerDateDisabled(next, restrictions, mode); n++) {
      if (sign > 0
        && restrictions.maxDate
        && next.startOf(unit).isAfter(
          restrictions.maxDate.endOf(unit)
        )
        || sign < 0
        && restrictions.minDate
        && next.endOf(unit).isBefore(
          restrictions.minDate.startOf(unit)
        )) return;
      next = next.add(sign * step, unit);
    }
    if (pickerDateDisabled(next, restrictions, mode)) return;
    onNavigate(next);
    await tick();
    root.querySelector<HTMLButtonElement>(`[data-picker-date="${label(next)}"]`)?.focus();
  }
</script>
<style>
  .date-cell { color:inherit;border:0;background:transparent;padding:0;font:inherit;cursor:pointer; }
  .date-cell:focus-visible { outline:2px solid var(--ant-color-primary);outline-offset:-2px; }
</style>
<div bind:this={root} class={`ant-picker-${mode}-panel`}>
  <div class="ant-picker-header">
    <button type="button" tabindex="-1" class="ant-picker-header-super-prev-btn" style:visibility={showPrevious ? undefined : 'hidden'} aria-label={locale.previousYear} onclick={() => move(-1, true)}><span class="ant-picker-super-prev-icon"></span></button>
    {#if mode === 'date'}<button type="button" tabindex="-1" class="ant-picker-header-prev-btn" style:visibility={showPrevious ? undefined : 'hidden'} aria-label={locale.previousMonth} onclick={() => move(-1)}><span class="ant-picker-prev-icon"></span></button>{/if}
    <div class="ant-picker-header-view">
      {#if mode === 'date'}<button type="button" tabindex="-1" class="ant-picker-month-btn" aria-label={locale.monthSelect} onclick={() => onModeChange('month')}>{months[panel.month()]}</button>{/if}
      <button type="button" tabindex="-1" class="ant-picker-year-btn" aria-label={mode === 'year' || mode === 'decade'
          ? locale.decadeSelect
          : locale.yearSelect} onclick={() => onModeChange(
              mode === 'date' || mode === 'month' ? 'year' : 'decade'
            )}>{mode === 'year'
            ? `${Math.floor(panel.year() / 10) * 10}-${Math.floor(panel.year() / 10) * 10 + 9}`
            : mode === 'decade'
              ? `${Math
                .floor(panel
                  .year() / 100) * 100}-${Math
                    .floor(panel
                      .year() / 100) * 100 + 99}`
              : adapter.locale.format(locale.locale, panel, locale.yearFormat ?? 'YYYY')}</button>
    </div>
    {#if mode === 'date'}<button type="button" tabindex="-1" class="ant-picker-header-next-btn" style:visibility={showNext ? undefined : 'hidden'} aria-label={locale.nextMonth} onclick={() => move(1)}><span class="ant-picker-next-icon"></span></button>{/if}
    <button type="button" tabindex="-1" class="ant-picker-header-super-next-btn" style:visibility={showNext ? undefined : 'hidden'} aria-label={locale.nextYear} onclick={() => move(1, true)}><span class="ant-picker-super-next-icon"></span></button>
  </div>
  <div class="ant-picker-body">
    <table class="ant-picker-content" role="grid" aria-label={panel.format('YYYY-MM')}>
      {#if mode === 'date'}<thead><tr>{#each weeks as _, n}<th scope="col">{weeks[(n + firstDay) % 7]}</th>{/each}</tr></thead>{/if}
      <tbody>
        {#each Array.from({ length: cells.length / width }, (_, n) => n) as row}
          <tr>{#each cells.slice(row * width, (row + 1) * width) as date (label(date))}
            {@const unavailable = pickerDateDisabled(date, restrictions, mode)}
            {@const inView = mode === 'date' ? date.month() === panel.month() : mode === 'month' ? true : date.year() >= Math.floor(panel.year() / (mode === 'year' ? 10 : 100)) * (mode === 'year' ? 10 : 100) && date.year() < Math.floor(panel.year() / (mode === 'year' ? 10 : 100)) * (mode === 'year' ? 10 : 100) + (mode === 'year' ? 10 : 100)}
            <td onpointerenter={event => {
                if (!unavailable && event.pointerType !== 'touch')
                  onHover?.(date);
              }} onpointerleave={() => onHover?.(null)} aria-selected={selectedCell(date)} aria-disabled={unavailable || undefined} title={label(date)} class={[
                  'ant-picker-cell',
                  inView && 'ant-picker-cell-in-view',
                  unavailable && 'ant-picker-cell-disabled',
                  !range && selectedCell(date) && 'ant-picker-cell-selected',
                  range?.[0]?.isSame(date, unit) && 'ant-picker-cell-range-start',
                  range?.[1]?.isSame(date, unit) && 'ant-picker-cell-range-end',
                  range?.[0]
                  && range[1]
                  && date.isAfter(range[0], unit)
                  && date.isBefore(
                    range[1],
                    unit
                  )
                  && 'ant-picker-cell-in-range',
                  mode === 'date' && now.isSame(date, 'day') && 'ant-picker-cell-today'
                ]}>
              <button type="button" data-picker-date={label(date)} aria-label={label(date)} disabled={unavailable} tabindex={date.isSame(panel, unit) ? 0 : -1} class="ant-picker-cell-inner date-cell" onclick={() => onSelect(date)} onkeydown={event => key(event, date)}>{mode === 'date'
                  ? date.date()
                  : mode === 'month'
                    ? months[date.month()]
                    : mode === 'year' ? date.year() : `${date.year()}-${date.year() + 9}`}</button>
            </td>
          {/each}</tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
