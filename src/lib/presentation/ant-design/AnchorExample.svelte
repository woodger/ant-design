<script lang="ts">
  import { Anchor } from '$lib/components/ant-design';
  let container = $state<HTMLDivElement>();
  let current = $state('');
</script>

<Anchor affix={false} showInkInFixed direction="horizontal" getContainer={() => container!} targetOffset={8}
  items={[{ key: 'details', href: '#anchor-demo-details', title: 'Описание' }, { key: 'delivery', href: '#anchor-demo-delivery', title: 'Доставка' }, { key: 'payment', href: '#anchor-demo-payment', title: 'Оплата' }]}
  onClick={event => event.preventDefault()} onChange={value => { current = value; }} />
<div bind:this={container} style="height:180px;overflow:auto;margin-top:12px;background:var(--ant-color-fill-quaternary)">
  <div id="anchor-demo-details" style="height:180px;padding:16px;box-sizing:border-box">Описание заказа</div>
  <div id="anchor-demo-delivery" style="height:180px;padding:16px;box-sizing:border-box">Условия доставки</div>
  <div id="anchor-demo-payment" style="height:220px;padding:16px;box-sizing:border-box">Способы оплаты</div>
</div>
<output aria-label="Текущий раздел Anchor">{current}</output>
