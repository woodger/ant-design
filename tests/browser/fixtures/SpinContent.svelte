<script lang="ts">
  let count = $state(0);
</script>

<label>Spin child input<input value="Initial child draft" /></label>
<label><input type="checkbox" /> Spin child checkbox</label>
<button type="button" onclick={() => { count++; }}>Spin child counter</button>
<output aria-label="Spin child count">{count}</output>
