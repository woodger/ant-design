<script lang="ts">
  let count = $state(0);
</script>

<label>Skeleton child input<input value="Initial Skeleton draft" /></label>
<label><input type="checkbox" /> Skeleton child checkbox</label>
<button type="button" onclick={() => { count++; }}>Skeleton child counter</button>
<output aria-label="Skeleton child count">{count}</output>
