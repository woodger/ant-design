<script lang="ts">
  import { Button, Flex, type FlexJustify } from '$lib/components/ant-design';

  let vertical = $state(false);
  let gap = $state('small');
  let justify = $state<FlexJustify>('flex-start');
</script>

<label><input type="checkbox" bind:checked={vertical} /> Вертикальная компоновка</label>
<label>Интервал <select bind:value={gap}><option value="small">Маленький</option><option value="medium">Средний</option><option value="large">Большой</option></select></label>
<label>Выравнивание <select bind:value={justify}><option value="flex-start">В начале</option><option value="center">В центре</option><option value="space-between">Между элементами</option></select></label>
<Flex {vertical} {gap} {justify} wrap style="margin-top:16px">
  <Button type="primary">Основное действие</Button><Button>Дополнительное</Button><Button type="dashed">Другие действия</Button>
</Flex>
