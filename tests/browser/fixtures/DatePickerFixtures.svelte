<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  import { DatePicker, ConfigProvider, Form, FormItem, createForm, enUS } from 'antd-svelte';

  dayjs.extend(utc);
  let value = $state<Dayjs | null>(dayjs('2026-10-15T10:20:30.123'));
  let timeValue = $state<Dayjs | null>(dayjs.utc('2026-10-15T10:20:30.123Z'));
  let accept = $state(true);
  let changes = $state<string[]>([]);
  let calendars = $state<string[]>([]);
  let opens = $state<boolean[]>([]);
  let data = $state('');
  let bounds = $state(false);
  let readOnly = $state(false);
  let confirm = $state(true);
  let invalid = $state(false);
  let noSeconds = $state(false);
  let customLocale = $state(false);
  let milliseconds = $state(false);
  const form = createForm<{ when: Dayjs | null }>(
    {
      initialValues: { when: null },
      rules: { when: [{ required: true, message: 'Choose a date' }] }
    }
  );
  let submitted = $state('');
</script>
<section id="date-picker-fixture" aria-label="DatePicker fixture">
  <form
    onsubmit={event => {
      event.preventDefault();
      const dataSource = new FormData(event.currentTarget);
      data = JSON.stringify({ date: dataSource.get('date'), time: dataSource.get('time') });
    }}
  >
    <label for="fixture-date">Calendar date</label>
    <DatePicker
      id="fixture-date"
      name="date"
      {value}
      onChange={(next, text) => {
        changes = [...changes, text];
        if (accept) value = next;
      }}
      minDate={bounds ? dayjs('2026-10-10') : undefined}
      maxDate={bounds ? dayjs('2026-11-20') : undefined}
      disabledDate={date => bounds && date.date() === 13}
      onOpenChange={next => { opens = [...opens, next]; }}
    />
    <label for="fixture-datetime">Calendar datetime</label>
    <DatePicker
      id="fixture-datetime"
      name="time"
      value={timeValue}
      format={milliseconds ? 'YYYY-MM-DD HH:mm:ss.SSS' : noSeconds ? 'YYYY-MM-DD HH:mm' : undefined}
      showTime={{
        format: milliseconds ? 'HH:mm:ss.SSS' : noSeconds ? 'HH:mm' : 'HH:mm:ss',
        millisecondStep: milliseconds ? 1 : 100,
        defaultOpenValue: dayjs.utc('2026-10-15T08:30:40.321Z')
      }}
      needConfirm={confirm}
      inputReadOnly={readOnly}
      preserveInvalidOnBlur={invalid}
      onChange={next => { if (accept) timeValue = next; }}
      onCalendarChange={(_date, text, info) => { calendars = [...calendars, `${info.source}:${text}`]; }}
      disabledTime={() =>
      ({
        disabledHours: () => bounds ? [11] : [],
        disabledMinutes: hour => bounds && hour === 10 ? [25] : []
      })}
    />
    <button type="submit">Read picker data</button>
  </form>
  <label><input type="checkbox" bind:checked={accept} /> Accept picker changes</label>
  <label><input type="checkbox" bind:checked={bounds} /> Restrict picker dates and times</label>
  <label><input type="checkbox" bind:checked={readOnly} /> Readonly picker input</label>
  <label><input type="checkbox" bind:checked={confirm} /> Confirm picker datetime</label>
  <label><input type="checkbox" bind:checked={invalid} /> Preserve invalid picker text</label>
  <label><input type="checkbox" bind:checked={milliseconds} /> Picker millisecond precision</label>
  <label><input type="checkbox" bind:checked={noSeconds} /> Hide picker seconds</label>
  <button
    type="button"
    onclick={() => {
      value = dayjs('2028-02-29');
      timeValue = dayjs.utc('2028-02-29T14:15:16.789Z');
    }}
  >Replace picker values</button>
  <button
    type="button"
    onclick={() => {
      value = null;
      timeValue = null;
    }}
  >Clear picker values</button>
  <button type="button">Outside picker</button>
  <output aria-label="Picker value">{value?.format('YYYY-MM-DD') ?? 'null'}</output>
  <output aria-label="Picker datetime value">{timeValue?.toISOString() ?? 'null'}</output>
  <output aria-label="Picker datetime UTC">{timeValue?.isUTC() ? 'UTC' : 'local'}</output>
  <output aria-label="Picker changes">{JSON.stringify(changes)}</output>
  <output aria-label="Picker calendar changes">{JSON.stringify(calendars)}</output>
  <output aria-label="Picker open changes">{JSON.stringify(opens)}</output>
  <output aria-label="Picker FormData">{data}</output>
  <Form
    {form}
    onFinish={values => { submitted = values.when?.format('YYYY-MM-DD HH:mm:ss.SSS') ?? 'null'; }}
  >
    <FormItem name="when" label="Form datetime"><DatePicker
      value={form.values.when}
      showTime
      defaultPickerValue={dayjs('2026-10-15T08:30')}
      onChange={next => form.setFieldValue('when', next)}
    /></FormItem>
    <button type="submit">Submit picker form</button><button type="reset">Reset picker form</button>
  </Form>
  <output aria-label="Form Dayjs value">{dayjs.isDayjs(form.values.when) ? 'Dayjs' : 'null'}</output>
  <output aria-label="Form submitted date">{submitted}</output>
  <label><input type="checkbox" bind:checked={customLocale} /> English picker locale</label>
  <ConfigProvider locale={customLocale ? enUS : undefined}>
    <label for="default-date-picker">Uncontrolled date</label><DatePicker
      id="default-date-picker"
      defaultValue={dayjs('2026-10-15')}
    />
    <label for="enabled-date-picker">Enabled date</label><DatePicker
      id="enabled-date-picker"
      disabled={false}
    />
  </ConfigProvider>
</section>
