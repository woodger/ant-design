<script lang="ts">
  // Геометрия Ant Design 6.6.8, es/empty/{empty,simple}.js — MIT, vendor/LICENSE.ant-design.
  // SHA-256 архива antd-6.6.8.tgz: 8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa.
  let { simple = false }: { simple?: boolean; } = $props();
  const id = $props.id();
  let colors = $derived(
    simple
      ? [
        ['border', '--ant-color-fill'],
        ['shadow', '--ant-color-fill-tertiary'],
        ['content', '--ant-color-fill-quaternary']
      ]
      : [
        ['panel', '--ant-color-fill-tertiary'],
        ['border', '--ant-color-text-quaternary'],
        ['detail', '--ant-color-fill'],
        ['shadow', '--ant-color-fill-secondary']
      ]
  );
  function paint(name: string) {
    return `url(#${id}-${name})`;
  }
</script>

<svg width={simple ? 64 : 184} height={simple ? 41 : 152} viewBox={simple ? '0 0 64 41' : '0 0 184 152'} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>
    <!-- Наложение fill на фон заменяет getAsSolidColor без вычисления CSS-токенов в JavaScript. -->
    {#each colors as [name, token] (name)}<pattern id={`${id}-${name}`} width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="var(--ant-color-bg-container)" /><rect width="1" height="1" fill={`var(${token})`} /></pattern>{/each}
  </defs>
  {#if simple}
    <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
      <ellipse fill={paint('shadow')} cx="32" cy="33" rx="32" ry="7" />
      <g fill-rule="nonzero" stroke={paint('border')}>
        <path d="M55 12.8 44.9 1.3Q44 0 42.9 0H21.1q-1.2 0-2 1.3L9 12.8V22h46z" />
        <path d="M41.6 16c0-1.7 1-3 2.2-3H55v18.1c0 2.2-1.3 3.9-3 3.9H12c-1.7 0-3-1.7-3-3.9V13h11.2c1.2 0 2.2 1.3 2.2 3s1 2.9 2.2 2.9h14.8c1.2 0 2.2-1.4 2.2-3" fill={paint('content')} />
      </g>
    </g>
  {:else}
    <g fill="none" fill-rule="evenodd">
      <g transform="translate(24 31.7)">
        <ellipse fill-opacity=".8" fill={paint('shadow')} cx="67.8" cy="106.9" rx="67.8" ry="12.7" />
        <path fill={paint('border')} d="M122 69.7 98.1 40.2a6 6 0 0 0-4.6-2.2H42.1a6 6 0 0 0-4.6 2.2l-24 29.5V85H122z" />
        <path fill={paint('panel')} d="M33.8 0h68a4 4 0 0 1 4 4v93.3a4 4 0 0 1-4 4h-68a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4" />
        <path fill={paint('detail')} d="M42.7 10h50.2a2 2 0 0 1 2 2v25a2 2 0 0 1-2 2H42.7a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2m.2 39.8h49.8a2.3 2.3 0 1 1 0 4.5H42.9a2.3 2.3 0 0 1 0-4.5m0 11.7h49.8a2.3 2.3 0 1 1 0 4.6H42.9a2.3 2.3 0 0 1 0-4.6m79 43.5a7 7 0 0 1-6.8 5.4H20.5a7 7 0 0 1-6.7-5.4l-.2-1.8V69.7h26.3c2.9 0 5.2 2.4 5.2 5.4s2.4 5.4 5.3 5.4h34.8c2.9 0 5.3-2.4 5.3-5.4s2.3-5.4 5.2-5.4H122v33.5q0 1-.2 1.8" />
      </g>
      <path fill={paint('detail')} d="m149.1 33.3-6.8 2.6a1 1 0 0 1-1.3-1.2l2-6.2q-4.1-4.5-4.2-10.4c0-10 10.1-18.1 22.6-18.1S184 8.1 184 18.1s-10.1 18-22.6 18q-6.8 0-12.3-2.8" />
      <g fill="var(--ant-color-bg-container)" transform="translate(149.7 15.4)"><circle cx="20.7" cy="3.2" r="2.8" /><path d="M5.7 5.6H0L2.9.7zM9.3.7h5v5h-5z" /></g>
    </g>
  {/if}
</svg>
