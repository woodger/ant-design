<script lang="ts">
  import { tick, untrack, type Snippet } from 'svelte';
  import { useConfig } from './config-context';
  import { getPaginationItems, getPaginationState, getPageSizeOptions } from './pagination.engine';
  import { ruRU, type ComponentSize, type PaginationLocale } from './types';
  import Icon from './Icon.svelte';
  import Select from './Select.svelte';

  /** Постраничная навигация с bind:current/pageSize и нормализацией диапазона. */
  export interface PaginationProps {
    /** @defaultValue 0 */
    total?: number;
    /** Поддерживает bind:current. */
    current?: number;
    /** @defaultValue 1 */
    defaultCurrent?: number;
    /** Поддерживает bind:pageSize. */
    pageSize?: number;
    /** @defaultValue 10 */
    defaultPageSize?: number;
    pageSizeOptions?: readonly number[];
    showSizeChanger?: boolean;
    /** @defaultValue false */
    hideOnSinglePage?: boolean;
    showTotal?: Snippet<[total: number, range: [number, number]]>;
    disabled?: boolean;
    size?: ComponentSize;
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, pageSize: number) => void;
    id?: string;
    'aria-label'?: string;
    class?: string;
    style?: string;
  }

  let {
    total = 0,
    current = $bindable(),
    defaultCurrent = 1,
    pageSize = $bindable(),
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    showSizeChanger,
    hideOnSinglePage = false,
    showTotal,
    disabled,
    size,
    onChange,
    onShowSizeChange,
    id,
    'aria-label': ariaLabel,
    class: className = '',
    style
  }: PaginationProps = $props();

  const config = useConfig();
  const initialCurrent = untrack(() => defaultCurrent);
  const initialSize = untrack(() => defaultPageSize);
  let navigation = $state<HTMLElement>();
  let pagination = $derived(
    getPaginationState(total, current ?? initialCurrent, pageSize ?? initialSize)
  );
  let items = $derived(getPaginationItems(pagination));
  let resolvedDisabled = $derived(disabled ?? config.componentDisabled);
  let resolvedSize = $derived(size ?? config.componentSize);
  let sizeOptions = $derived(getPageSizeOptions(pageSizeOptions, pagination.pageSize));
  let strings: PaginationLocale = $derived({
    label: config.locale.pagination?.label ?? ruRU.pagination.label,
    previous: config.locale.pagination?.previous ?? ruRU.pagination.previous,
    next: config.locale.pagination?.next ?? ruRU.pagination.next,
    page: config.locale.pagination?.page ?? ruRU.pagination.page,
    jumpPrevious: config.locale.pagination?.jumpPrevious ?? ruRU.pagination.jumpPrevious,
    jumpNext: config.locale.pagination?.jumpNext ?? ruRU.pagination.jumpNext,
    pageSize: config.locale.pagination?.pageSize ?? ruRU.pagination.pageSize,
    itemsPerPage: config.locale.pagination?.itemsPerPage ?? ruRU.pagination.itemsPerPage
  });

  async function changePage(next: number, button: HTMLButtonElement) {
    const target = getPaginationState(pagination.total, next, pagination.pageSize).current;

    if (resolvedDisabled || target === pagination.current) {
      return;
    }

    current = target;
    onChange?.(target, pagination.pageSize);

    await tick();

    if (!button.isConnected || button.disabled) {
      navigation?.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus();
    }
  }

  function changeSize(next: number | undefined) {
    if (resolvedDisabled || next === undefined || next === pagination.pageSize) {
      return;
    }

    const previousCurrent = pagination.current;
    const target = getPaginationState(pagination.total, previousCurrent, next);
    pageSize = target.pageSize;
    current = target.current;
    onShowSizeChange?.(previousCurrent, target.pageSize);
    onChange?.(target.current, target.pageSize);
  }
</script>

<style>
  .ant-pagination { flex-wrap: wrap; row-gap: var(--ant-margin-xs); }
  .ant-pagination .ant-pagination-options { display: inline-block; }
  .ant-pagination .page-button { display: block; width: 100%; height: 100%; padding: 0 6px; border: 0; border-radius: inherit; background: transparent; color: inherit; font: inherit; cursor: inherit; }
  .ant-pagination .page-button[aria-current='page'] { color: var(--ant-pagination-item-active-color); }
  .ant-pagination button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  .jump-button { width: 100%; height: 100%; padding: 0; border: 0; border-radius: inherit; background: transparent; color: var(--ant-color-text-tertiary); font: inherit; cursor: inherit; }
  .jump-button:hover { color: var(--ant-color-primary); }
  .ant-pagination button:disabled { cursor: not-allowed; }
  .ant-pagination.ant-pagination-disabled .page-button { color: var(--ant-color-text-disabled); }
</style>

{#if !hideOnSinglePage || pagination.pageCount > 1}
  <nav bind:this={navigation} {id} aria-label={ariaLabel ?? strings.label} dir={config.direction} {style}>
    <ul class={[
        'ant-pagination',
        `ant-pagination-${resolvedSize}`,
        resolvedSize === 'small' && 'ant-pagination-mini',
        resolvedDisabled && 'ant-pagination-disabled',
        config.direction === 'rtl' && 'ant-pagination-rtl',
        className
      ]}>
      {#if showTotal}<li class="ant-pagination-total-text">{@render showTotal(pagination.total, pagination.range)}</li>{/if}
      <li class={[
          'ant-pagination-prev',
          (resolvedDisabled || pagination.current === 1) && 'ant-pagination-disabled'
        ]}>
        <button type="button" class="ant-pagination-item-link" aria-label={strings.previous} disabled={resolvedDisabled || pagination.current === 1} onclick={(event) => changePage(
            pagination.current - 1,
            event.currentTarget
          )}><Icon name={config.direction === 'rtl' ? 'right' : 'left'} /></button>
      </li>
      {#each items as item (item)}
        {#if typeof item === 'number'}
          <li class={[
              'ant-pagination-item',
              item === pagination.current && 'ant-pagination-item-active'
            ]}>
            <button type="button" class="page-button" aria-label={`${strings.page} ${item}`} aria-current={item === pagination.current ? 'page' : undefined} disabled={resolvedDisabled} onclick={(event) => changePage(item, event.currentTarget)}>{item}</button>
          </li>
        {:else}
          <li class={item === 'jump-prev'
              ? 'ant-pagination-jump-prev'
              : 'ant-pagination-jump-next'}>
            <button type="button" class="jump-button" aria-label={item === 'jump-prev'
                ? strings.jumpPrevious
                : strings.jumpNext} disabled={resolvedDisabled} onclick={(event) => changePage(
                    pagination.current + (item === 'jump-prev' ? -5 : 5),
                    event.currentTarget
                  )}><span aria-hidden="true">•••</span></button>
          </li>
        {/if}
      {/each}
      <li class={[
          'ant-pagination-next',
          (resolvedDisabled
            || pagination.current === pagination.pageCount)
          && 'ant-pagination-disabled'
        ]}>
        <button type="button" class="ant-pagination-item-link" aria-label={strings.next} disabled={resolvedDisabled || pagination.current === pagination.pageCount} onclick={(event) => changePage(
            pagination.current + 1,
            event.currentTarget
          )}><Icon name={config.direction === 'rtl' ? 'left' : 'right'} /></button>
      </li>
      {#if showSizeChanger ?? pagination.total > 50}
        <li class="ant-pagination-options">
          <Select
            aria-label={strings.pageSize}
            value={pagination.pageSize}
            options={sizeOptions.map(
                (value) => ({ value, label: `${value} ${strings.itemsPerPage}` })
              )}
            disabled={resolvedDisabled}
            size={resolvedSize}
            style="width: 112px"
            onValueChange={changeSize}
          />
        </li>
      {/if}
    </ul>
  </nav>
{/if}
