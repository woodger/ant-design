<script lang="ts">
  import { ConfigProvider, Divider, type ComponentSize, type DividerProps } from '../../src/lib/components/ant-design';

  let orientation = $state<DividerProps['orientation']>('horizontal');
  let placement = $state<DividerProps['titlePlacement']>('center');
  let variant = $state<DividerProps['variant']>('solid');
  let size = $state<DividerProps['size'] | 'inherit'>('inherit');
  let contextSize = $state<ComponentSize>();
  let text = $state('Section');
  let rich = $state(false);
  let dashed = $state(false);
  let plain = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let custom = $state(false);
  let margin = $state('');
  let nativeElement = $state<HTMLDivElement>();
</script>

{#snippet title()}<strong>{text}</strong>{/snippet}

<section id="divider-fixture" aria-label="Divider fixture">
  <h2>Divider</h2>
  <label>Divider orientation<select bind:value={orientation}><option>horizontal</option><option>vertical</option></select></label>
  <label>Divider placement<select bind:value={placement}><option>center</option><option>start</option><option>end</option><option>left</option><option>right</option></select></label>
  <label>Divider variant<select bind:value={variant}><option>solid</option><option>dashed</option><option>dotted</option></select></label>
  <label>Divider size<select bind:value={size}><option>inherit</option><option>small</option><option>medium</option><option>large</option></select></label>
  <label>Divider context size<select bind:value={contextSize}><option value={undefined}>inherit</option><option>small</option><option>middle</option><option>large</option></select></label>
  <label>Divider text<input bind:value={text} /></label>
  <label>Divider legacy margin<input bind:value={margin} /></label>
  <label><input type="checkbox" bind:checked={rich} /> Rich Divider title</label>
  <label><input type="checkbox" bind:checked={dashed} /> Dashed Divider alias</label>
  <label><input type="checkbox" bind:checked={plain} /> Plain Divider title</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Divider theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Divider theme</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Divider slots</label>
  <Divider id="divider-default" />
  <ConfigProvider componentSize={contextSize} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <ConfigProvider><Divider id="divider-nested" /></ConfigProvider>
    <button type="button">Before Divider</button>
    <div style="padding:16px; background:var(--ant-color-bg-container); color:var(--ant-color-text)">
      <Divider id="fixture-divider" aria-label="Sections" title="Divider title" bind:nativeElement
        {orientation} titlePlacement={placement} {variant} {dashed} {plain} size={size === 'inherit' ? undefined : size}
        orientationMargin={margin || undefined} children={rich ? title : text}
        classNames={({ props }) => custom ? { root: `custom-divider-${props.titlePlacement}`, rail: 'custom-divider-rail', content: 'custom-divider-content' } : {}}
        styles={custom ? { root: 'border-color:rgb(255, 0, 0)', rail: 'border-color:rgb(0, 128, 0)', content: 'font-style:italic' } : undefined}
      />
    </div>
    <button type="button">After Divider</button>
    <output aria-label="Divider native element">{nativeElement?.id}</output>
  </ConfigProvider>
</section>
