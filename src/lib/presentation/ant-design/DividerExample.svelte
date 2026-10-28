<script lang="ts">
  import { Divider, type DividerTitlePlacement } from '$lib/components/ant-design';

  let placement = $state<DividerTitlePlacement>('start');
  let variant = $state<'solid' | 'dashed' | 'dotted'>('solid');
  let plain = $state(false);
</script>

<label>Подпись <select bind:value={placement}><option value="start">В начале</option><option value="center">В центре</option><option value="end">В конце</option></select></label>
<label>Линия <select bind:value={variant}><option value="solid">Сплошная</option><option value="dashed">Штриховая</option><option value="dotted">Точечная</option></select></label>
<label><input type="checkbox" bind:checked={plain} /> Обычный текст</label>
<Divider titlePlacement={placement} {variant} {plain}>Разделы проекта</Divider>
<p>Разделитель отделяет содержимое и наследует тему, размер и направление.</p>
<Divider {variant} />
<div>Обзор<Divider orientation="vertical" {variant} />Участники<Divider vertical {variant} />Настройки</div>
