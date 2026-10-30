<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Input } from 'antd-svelte';

  let { name, onLifecycle }: { name: string; onLifecycle: (event: string) => void } = $props();
  let count = $state(0);

  onMount(() => {
    onLifecycle(`mount:${name}`);

    return () => onLifecycle(`destroy:${name}`);
  });
</script>

<style>
  label { display: block; margin-block: 12px; }
</style>

<label>{name} draft<Input defaultValue={`${name} initial`} name={name} /></label>
<Button onclick={() => { count++; }}>Increment {name}</Button>
<output aria-label={`${name} count`}>{count}</output>
