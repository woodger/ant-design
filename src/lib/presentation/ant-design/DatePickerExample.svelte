<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import { DatePicker } from '$lib/components/ant-design';
  let date = $state<Dayjs | null>(dayjs('2026-10-29'));
  let datetime = $state<Dayjs | null>(dayjs('2026-10-29T10:30:15.123'));
</script>
<div style="display:flex;gap:24px;flex-wrap:wrap">
  <div><label for="showcase-date">Дата события</label><DatePicker id="showcase-date" value={date} onChange={next => { date = next; }} /></div>
  <div><label for="showcase-datetime">Дата и время события</label><DatePicker id="showcase-datetime" value={datetime} showTime onChange={next => { datetime = next; }} /></div>
</div>
<output aria-label="Значение DatePicker">{date?.format('YYYY-MM-DD') ?? 'null'}</output>
<output aria-label="Значение datetime DatePicker">{datetime?.format('YYYY-MM-DD HH:mm:ss.SSS') ?? 'null'}</output>
