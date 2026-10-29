<script lang="ts">
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  import { RangePicker, Form, FormItem, createForm, type RangePickerValue } from '../../src/lib/components/ant-design';
  dayjs.extend(utc);
  let value = $state<RangePickerValue | null>([dayjs('2026-10-10'), dayjs('2026-10-20')]);
  let datetime = $state<RangePickerValue | null>([dayjs.utc('2026-10-10T10:20:30.123Z'), dayjs.utc('2026-10-20T14:15:16.789Z')]);
  let accept = $state(true);
  let order = $state(true);
  let allowStartEmpty = $state(false);
  let lockedStart = $state(false);
  let restricted = $state(false);
  let spanLimit = $state(false);
  let preserve = $state(false);
  let readonly = $state(false);
  let showNow = $state(false);
  let changes = $state<string[]>([]);
  let calendars = $state<string[]>([]);
  let oks = $state(0);
  let data = $state('');
  const form = createForm<{ period: RangePickerValue | null }>({ initialValues: { period: null }, rules: { period: [{ required: true, message: 'Choose a period' }] } });
  let submitted = $state('');
</script>
<section id="range-picker-fixture" aria-label="RangePicker fixture">
  <form onsubmit={event => { event.preventDefault(); data = JSON.stringify(new FormData(event.currentTarget).getAll('period')); }}>
    <label for="range-start">Range start</label><label for="range-end">Range end</label>
    <RangePicker id={{ start: 'range-start', end: 'range-end' }} name="period" {value} {order} {showNow} disabled={lockedStart ? [true, false] : undefined} allowEmpty={[allowStartEmpty, false]} inputReadOnly={readonly} preserveInvalidOnBlur={preserve}
      defaultPickerValue={[dayjs('2026-10-01'), dayjs('2026-10-01')]} minDate={restricted ? dayjs('2026-10-01') : undefined} maxDate={restricted ? dayjs('2026-12-31') : undefined}
      disabledDate={(date, info) => Boolean(restricted && date.date() === 13 || spanLimit && info.from && Math.abs(date.diff(info.from, 'day')) > 7)}
      onChange={(next, texts) => { changes = [...changes, JSON.stringify({ values: next?.map(date => date?.format('YYYY-MM-DD') ?? null) ?? null, texts })]; if (accept) value = next; }}
      onCalendarChange={(next, _texts, info) => { calendars = [...calendars, `${info.range}:${next.map(date => date?.format('YYYY-MM-DD') ?? 'null').join(',')}`]; }}
      presets={[{ label: 'October preset', value: () => [dayjs('2026-10-05'), dayjs('2026-10-08')] }]} />
    <button type="submit">Read range FormData</button>
  </form>
  <label for="range-time-start">Time range start</label><label for="range-time-end">Time range end</label>
  <RangePicker id={{ start: 'range-time-start', end: 'range-time-end' }} value={datetime} showTime={{ defaultOpenValue: [dayjs.utc('2026-10-01T08:30:40.321Z'), dayjs.utc('2026-10-01T18:20:30.654Z')] }}
    defaultPickerValue={[dayjs.utc('2026-10-01T08:30:40Z'), dayjs.utc('2026-10-01T18:20:30Z')]}
    disabledTime={(_date, part, info) => ({ disabledHours: () => restricted && part === 'end' && info.from ? [11] : [] })}
    onChange={next => { if (accept) datetime = next; }} onOk={() => { oks++; }} />
  <label><input type="checkbox" bind:checked={accept} /> Accept range changes</label>
  <label><input type="checkbox" bind:checked={order} /> Order range boundaries</label>
  <label><input type="checkbox" bind:checked={allowStartEmpty} /> Allow empty range start</label>
  <label><input type="checkbox" bind:checked={lockedStart} /> Lock range start</label>
  <label><input type="checkbox" bind:checked={restricted} /> Restrict range dates</label>
  <label><input type="checkbox" bind:checked={spanLimit} /> Limit range span</label>
  <label><input type="checkbox" bind:checked={readonly} /> Readonly range inputs</label>
  <label><input type="checkbox" bind:checked={showNow} /> Show range current date</label>
  <label><input type="checkbox" bind:checked={preserve} /> Preserve invalid range text</label>
  <button type="button" onclick={() => { value = null; datetime = null; }}>Clear range owner</button>
  <button type="button" onclick={() => { value = [dayjs('2028-02-29'), dayjs('2028-03-05')]; }}>Replace range owner</button>
  <output aria-label="Range value">{JSON.stringify(value?.map(date => date?.format('YYYY-MM-DD') ?? null) ?? null)}</output>
  <output aria-label="Time range value">{JSON.stringify(datetime?.map(date => date?.toISOString() ?? null) ?? null)}</output>
  <output aria-label="Range changes">{JSON.stringify(changes)}</output>
  <output aria-label="Range calendars">{JSON.stringify(calendars)}</output>
  <output aria-label="Range OK count">{oks}</output>
  <output aria-label="Range FormData">{data}</output>
  <label for="default-range-start">Default range start</label><label for="default-range-end">Default range end</label>
  <RangePicker id={{ start: 'default-range-start', end: 'default-range-end' }} defaultValue={[dayjs('2026-10-05'), dayjs('2026-10-08')]} />
  <Form {form} onFinish={values => { submitted = JSON.stringify(values.period?.map(date => dayjs.isDayjs(date) ? 'Dayjs' : null)); }}>
    <FormItem name="period" label="Form period"><RangePicker defaultPickerValue={dayjs('2026-10-01')} value={form.values.period} onChange={next => form.setFieldValue('period', next)} /></FormItem>
    <button type="submit">Submit range form</button><button type="reset">Reset range form</button>
  </Form>
  <output aria-label="Submitted range objects">{submitted}</output>
</section>
