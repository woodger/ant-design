<script lang="ts">
  import type { Dayjs } from 'dayjs';
  import { timeColumns } from './date-picker.engine';
  import type { DatePickerDisabledTime, DatePickerTimeConfig } from './date-picker.types';
  let { value, config, format, disabledTime, onSelect }: {
    value: Dayjs;
    config: DatePickerTimeConfig;
    format: string;
    disabledTime?: (date: Dayjs) => DatePickerDisabledTime;
    onSelect: (value: Dayjs) => void;
  } = $props();
  let columns = $derived(timeColumns(config, format));
  let root: HTMLDivElement;
  const scrollValues = new WeakMap<Element, string>();
  $effect(() => {
    void value;
    void columns;
    const host = root;
    const view = host?.ownerDocument.defaultView;
    if (!view) return;
    const frame = view.requestAnimationFrame(() => {
      for (const column of host.querySelectorAll<HTMLUListElement>('ul')) {
        const selected = column.querySelector<HTMLLIElement>(
          '.ant-picker-time-panel-cell-selected'
        );
        const first = column.querySelector<HTMLLIElement>('li');
        if (!selected || !first)
          continue;
        const signature = `${selected.textContent}:${[...column.children].map(
          cell => cell.textContent + cell.className
        ).join(
          ';'
        )}`;
        if (scrollValues.get(column) === signature)
          continue;
        column.scrollTop = selected.offsetTop - first.offsetTop;
        scrollValues.set(column, signature);
      }
    });
    return () => view.cancelAnimationFrame(frame);
  });
  function items(column: ReturnType<typeof timeColumns>[number]) {
    return Array.from(
      { length: Math.ceil(column.count / column.step) },
      (_, n) => n * column.step
    )
      .filter(
        item => column.unit !== 'hour' || !config.use12Hours || (item < 12) === (value.hour() < 12)
      );
  }
  function keyboard(event: KeyboardEvent) {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const target = event.currentTarget as HTMLButtonElement;
    const buttons = [
      ...target.closest('ul')!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    ];
    const index = buttons.indexOf(target);
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[next]?.click();
    buttons[next]?.focus();
  }
  let dynamic = $derived(disabledTime?.(value));
  let restrictions = $derived(
    {
      ...config,
      ...dynamic,
      disabledHours: dynamic?.disabledHours ?? config.disabledHours,
      disabledMinutes: dynamic?.disabledMinutes ?? config.disabledMinutes,
      disabledSeconds: dynamic?.disabledSeconds ?? config.disabledSeconds
    }
  );
  function blocked(unit: 'hour' | 'minute' | 'second' | 'millisecond', item: number) {
    if (unit === 'hour') return restrictions.disabledHours?.().includes(item) ?? false;
    if (unit === 'minute') return restrictions.disabledMinutes?.(value.hour()).includes(item)
      ?? false;
    if (unit === 'second') return restrictions
      .disabledSeconds?.(value
        .hour(), value
          .minute())
      .includes(
        item
      )
      ?? false;
    return restrictions
      .disabledMilliseconds?.(value
        .hour(), value
          .minute(), value
            .second())
      .includes(
        item
      )
      ?? false;
  }
</script>
<style>
  button { color:inherit;width:100%;border:0;background:transparent;font:inherit;text-align:inherit;padding:0;cursor:pointer; }
  button:focus-visible { outline:2px solid var(--ant-color-primary);outline-offset:-2px; }
</style>
<div bind:this={root} class="ant-picker-time-panel">
  <div class="ant-picker-content">
    {#each columns as column (column.unit)}
      <ul class="ant-picker-time-panel-column" aria-label={column.unit}>
        {#each items(column) as item (item)}
          {@const unavailable = blocked(column.unit, item)}
          {#if !config.hideDisabledOptions || !unavailable}
            <li class={[
                'ant-picker-time-panel-cell',
                value.get(column.unit) === item && 'ant-picker-time-panel-cell-selected',
                unavailable && 'ant-picker-time-panel-cell-disabled'
              ]}>
              <button type="button" class="ant-picker-time-panel-cell-inner" disabled={unavailable} tabindex={value.get(column.unit) === item ? 0 : -1} onkeydown={keyboard} aria-label={`${column.unit} ${item}`} aria-pressed={value.get(column.unit) === item} onclick={() => onSelect(value.set(column.unit, item))}>{String(
                  config.use12Hours && column.unit === 'hour' ? item % 12 || 12 : item
                ).padStart(
                  column.unit === 'millisecond' ? 3 : 2,
                  '0'
                )}</button>
            </li>
          {/if}
        {/each}
      </ul>
    {/each}
    {#if config.use12Hours}
      <ul class="ant-picker-time-panel-column" aria-label="meridiem">
        {#each [0, 12] as hour}
          <li class={[
              'ant-picker-time-panel-cell',
              (value.hour() < 12) === (hour === 0) && 'ant-picker-time-panel-cell-selected'
            ]}>
            <button type="button" class="ant-picker-time-panel-cell-inner" tabindex={(value.hour() < 12) === (hour === 0) ? 0 : -1} onkeydown={keyboard} aria-pressed={(value.hour() < 12) === (hour === 0)} onclick={() => onSelect(value.hour(value.hour() % 12 + hour))}>{hour ? 'PM' : 'AM'}</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
