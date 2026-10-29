<script lang="ts">
  import { ConfigProvider, Watermark, Modal, Drawer, type WatermarkContent, type WatermarkFont } from '../../src/lib/components/ant-design';

  let visible = $state(true); let inherit = $state(true); let dark = $state(false); let compact = $state(false);
  let fixed = $state(false); let rotate = $state(-22); let gap = $state<'default' | 'small' | 'zero'>('default');
  let offset = $state<'default' | 'positive' | 'negative' | 'zero'>('default');
  let text = $state<'text' | 'multi' | 'object' | 'empty' | 'none'>('text');
  let picture = $state<'off' | 'red' | 'blue' | 'invalid' | 'late'>('off'); let source = $state<string>();
  let rich = $state(false); let customRoot = $state(false); let high = $state(false); let nestedInherit = $state(true);
  let modal = $state(false); let drawer = $state(false); let nested = $state(false); let panelMounted = $state(true);
  let removed = $state(0); let actions = $state(0); let nativeElement = $state<HTMLDivElement>();
  let paint = $state.raw<CanvasGradient | CanvasPattern>();
  const red = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><path fill="red" d="M0 0h40v20H0z"/></svg>')}`;
  const blue = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><path fill="blue" d="M0 0h40v20H0z"/></svg>')}`;
  let contents = $derived<WatermarkContent | undefined | readonly WatermarkContent[]>(text === 'none' ? undefined : text === 'empty' ? '' : text === 'object' ? { text: 'Object text', font: { fontSize: 22, color: 'green' } } : text === 'multi' ? ['First line', { text: 'Second line', font: { fontSize: 12, fontStyle: 'italic', fontWeight: 700 } }, { text: 'Inherited font', font: { fontSize: undefined } }] : 'Ant Design');
  let font = $derived<WatermarkFont>({ ...rich ? { fontSize: '20', color: 'rgb(100,0,200)', textAlign: 'left' as const, fontStyle: 'italic' as const, fontFamily: 'serif', fontWeight: 700 } : {}, ...paint ? { color: paint } : {} });
  let image = $derived(picture === 'red' ? red : picture === 'blue' ? blue : picture === 'invalid' ? 'data:image/png;base64,bm90YW5pbWFnZQ==' : picture === 'late' ? source : undefined);

  function usePaint(kind: 'gradient' | 'pattern') {
    const canvas = document.createElement('canvas'); canvas.width = 8; canvas.height = 8;
    const context = canvas.getContext('2d')!;
    if (kind === 'gradient') {
      const gradient = context.createLinearGradient(0, 0, 80, 0);
      gradient.addColorStop(0, 'red'); gradient.addColorStop(0.49, 'red'); gradient.addColorStop(0.5, 'blue'); gradient.addColorStop(1, 'blue');
      paint = gradient;
    } else {
      context.fillStyle = 'red'; context.fillRect(0, 0, 4, 8); context.fillStyle = 'blue'; context.fillRect(4, 0, 4, 8);
      paint = context.createPattern(canvas, 'repeat') ?? undefined;
    }
  }
</script>

<section id="watermark-fixture">
  <h2>Watermark</h2>
  <label><input type="checkbox" bind:checked={visible} /> Mount Watermark</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Watermark</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Watermark theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Watermark theme</label>
  <label><input type="checkbox" bind:checked={fixed} /> Fixed Watermark dimensions</label>
  <label><input type="checkbox" bind:checked={rich} /> Rich Watermark font</label>
  <label><input type="checkbox" bind:checked={customRoot} /> Custom Watermark root styles</label>
  <label><input type="checkbox" bind:checked={high} /> Custom Watermark zIndex</label>
  <label><input type="checkbox" bind:checked={nestedInherit} /> Nested inherit Watermark</label>
  <label><input type="checkbox" bind:checked={panelMounted} /> Mount Watermark panels</label>
  <label>Watermark rotation<input type="number" bind:value={rotate} /></label>
  <label>Watermark gap<select bind:value={gap}><option>default</option><option>small</option><option>zero</option></select></label>
  <label>Watermark offset<select bind:value={offset}><option>default</option><option>positive</option><option>negative</option><option>zero</option></select></label>
  <label>Watermark content<select bind:value={text}><option>text</option><option>multi</option><option>object</option><option>empty</option><option>none</option></select></label>
  <label>Watermark image<select bind:value={picture}><option>off</option><option>red</option><option>blue</option><option>invalid</option><option>late</option></select></label>
  <button type="button" onclick={() => { picture = 'late'; source = '/watermark-old.svg'; }}>Request old Watermark image</button>
  <button type="button" onclick={() => { picture = 'late'; source = '/watermark-new.svg'; fixed = true; }}>Request new Watermark image</button>
  <button type="button" onclick={() => usePaint('gradient')}>Use Watermark gradient</button><button type="button" onclick={() => usePaint('pattern')}>Use Watermark pattern</button>
  <ConfigProvider watermark={{ class: 'watermark-context', style: 'overflow:visible;opacity:0.9' }} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    {#if visible}<Watermark class="fixture-watermark" rootClassName="watermark-owner" content={contents} {font} {image} {rotate} width={fixed ? 200 : undefined} height={fixed ? 200 : undefined}
      gap={gap === 'small' ? [20, 30] : gap === 'zero' ? [0, 0] : undefined} offset={offset === 'positive' ? [200, 200] : offset === 'negative' ? [-200, -200] : offset === 'zero' ? [0, 0] : undefined}
      zIndex={high ? 5 : undefined} {inherit} bind:nativeElement onRemove={() => { removed++; }} style={`height:240px;overflow:${customRoot ? 'visible' : 'hidden'};position:${customRoot ? 'absolute' : 'relative'};opacity:1`}>
      <p>Protected content <button type="button" onclick={() => { actions++; }}>Watermark child action</button></p>
      <button type="button" onclick={() => { modal = true; }}>Open Watermark Modal</button>
      <button type="button" onclick={() => { drawer = true; }}>Open Watermark Drawer</button>
      {#if panelMounted}
        <Modal title="Watermark Modal" bind:open={modal} footer={null}><p>Modal protected content</p><button type="button">Modal focus target</button></Modal>
        <Drawer title="Watermark Drawer" bind:open={drawer} destroyOnHidden><p>Drawer protected content</p><button type="button">Drawer focus target</button></Drawer>
      {/if}
    </Watermark>{/if}
    <Watermark class="outer-watermark" content="Outer watermark" style="height:100px">
      <Watermark class="inner-watermark" content="Inner watermark" inherit={nestedInherit}>
        <button type="button" onclick={() => { nested = true; }}>Open nested Watermark Modal</button>
        <Modal title="Nested Watermark Modal" bind:open={nested} footer={null}><p>Nested protected content</p></Modal>
      </Watermark>
    </Watermark>
    <ConfigProvider watermark={{ style: 'opacity:0.5' }}><Watermark class="isolated-watermark" content="Own config" style="height:50px" /></ConfigProvider>
  </ConfigProvider>
  <output aria-label="Watermark removals">{removed}</output><output aria-label="Watermark actions">{actions}</output><output aria-label="Watermark native element">{nativeElement?.tagName}</output>
</section>
