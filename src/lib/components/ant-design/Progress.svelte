<script lang="ts">
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { getProgressCircleGeometry, normalizeProgressPercent, resolveProgressCircleSize, resolveProgressLineSize, resolveProgressStatus } from './progress.engine';
  import { ruRU } from './types';
  import type { ProgressCircleSize, ProgressProps } from './progress.types';

  let { type = 'line', percent = 0, status, size = 'medium', strokeWidth, showInfo = true, format, strokeColor, railColor, strokeLinecap = 'round', id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, 'aria-valuetext': ariaValueText, class: className = '', style }: ProgressProps = $props();
  const config = useConfig();
  const icons = { line: { success: 'check-circle-filled', exception: 'close-circle-filled' }, circle: { success: 'check', exception: 'close' } } as const;
  let value = $derived(normalizeProgressPercent(percent));
  let resolvedStatus = $derived(resolveProgressStatus(value, type === 'circle' && status === 'active' ? 'normal' : status));
  let lineSize = $derived(resolveProgressLineSize(size));
  let diameter = $derived(resolveProgressCircleSize(size as ProgressCircleSize));
  let circle = $derived(getProgressCircleGeometry(value, diameter, strokeWidth));
  let strings = $derived({ ...ruRU.progress, ...config.locale.progress });
  let text = $derived(format ? format(value) : `${value}%`);
  let valueText = $derived(ariaValueText ?? (format ? text : resolvedStatus === 'success' ? `${text}, ${strings.successText}` : resolvedStatus === 'exception' ? `${text}, ${strings.exceptionText}` : text));
  let statusIcon = $derived(!format && (resolvedStatus === 'success' || resolvedStatus === 'exception') ? icons[type][resolvedStatus] : undefined);
</script>

<style>
  .ant-progress { min-width: 0; max-width: 100%; }
  .ant-progress-line .ant-progress-body, .ant-progress-line .ant-progress-rail { min-width: 0; }
  .ant-progress-line .ant-progress-indicator { flex: none; max-width: 50%; overflow: hidden; text-overflow: ellipsis; }
  .ant-progress-circle .ant-progress-body { max-width: 100%; }
  .ant-progress-circle .ant-progress-indicator { padding-inline: 10%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .ant-progress-circle svg { display: block; width: 100%; height: auto; }
  .ant-progress-circle-path { transition: stroke-dashoffset var(--ant-motion-duration-slow) var(--ant-motion-ease-in-out-circ), stroke var(--ant-motion-duration-slow); }
  .anticon { display: inline-flex; }
  .ant-progress-rtl.ant-progress-status-active .ant-progress-track::after { animation-name: ant-svelte-progress-rtl-active; }
  @keyframes ant-svelte-progress-rtl-active { 0% { transform: translateX(100%) scaleX(0); opacity: 0.1; } 20% { transform: translateX(100%) scaleX(0); opacity: 0.5; } to { transform: translateX(0) scaleX(1); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .ant-progress-line .ant-progress-track, .ant-progress-circle-path { transition: none; }
    .ant-progress-line.ant-progress-status-active .ant-progress-track::after { animation: none; }
  }
</style>

{#snippet indicator()}
  <span class={['ant-progress-indicator', type === 'line' && 'ant-progress-indicator-outer ant-progress-indicator-end']} aria-hidden="true" title={valueText} dir="auto">{#if statusIcon}<span class="anticon"><Icon name={statusIcon} /></span>{:else}{text}{/if}</span>
{/snippet}

<div {id} role="progressbar" aria-label={ariaLabel ?? (ariaLabelledby ? undefined : strings.label)} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value} aria-valuetext={valueText} dir={config.direction} class={['ant-progress ant-progress-css-var', `ant-progress-${type}`, `ant-progress-status-${resolvedStatus}`, type === 'line' && 'ant-progress-line-align-end ant-progress-line-position-outer', showInfo && 'ant-progress-show-info', size === 'small' && 'ant-progress-small', config.direction === 'rtl' && 'ant-progress-rtl', className]} {style}>
  {#if type === 'circle'}
    <div class="ant-progress-body" style:width={`${diameter}px`} style:font-size={`${diameter * 0.15 + 6}px`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle class="ant-progress-circle-rail" cx="50" cy="50" r={circle.radius} fill="none" stroke-width={circle.strokeWidth} style:stroke={railColor} />
        <circle class="ant-progress-circle-path" cx="50" cy="50" r={circle.radius} fill="none" stroke-width={circle.strokeWidth} stroke-linecap={strokeLinecap} stroke-dasharray={`${circle.circumference} ${circle.circumference}`} stroke-dashoffset={circle.offset} transform="rotate(-90 50 50)" style:stroke={strokeColor} style:opacity={value === 0 ? 0 : 1} />
      </svg>
      {#if showInfo && diameter > 20}{@render indicator()}{/if}
    </div>
  {:else}
    <div class="ant-progress-body" style:width={lineSize.width}>
      <div class="ant-progress-rail" style:height={`${lineSize.height}px`} style:background={railColor} style:border-radius={strokeLinecap === 'round' ? undefined : '0px'}><div class="ant-progress-track" style:width={`${value}%`} style:background={strokeColor}></div></div>
      {#if showInfo}{@render indicator()}{/if}
    </div>
  {/if}
</div>
