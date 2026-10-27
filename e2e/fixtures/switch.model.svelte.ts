import { createForm } from '../../src/lib/components/ant-design';
import { createSwitchSetting } from '../../src/lib/presentation/ant-design/switch-setting.model.svelte';

export function createSwitchControls() {
  let checked = $state<boolean | undefined>(false);
  let defaultChecked = $state(true);
  let changes = $state<boolean[]>([]);
  let clicks = $state(0);
  let defaultChanges = $state(0);
  let disabled = $state(false);
  let loading = $state(false);
  let small = $state(false);
  let providerSmall = $state(false);
  let cancelClick = $state(false);
  let cancelReset = $state(false);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let data = $state('');
  let submissions = $state(0);
  let externalData = $state('');
  let formDisabled = $state(false);
  let saved = $state('');
  let finishes = $state(0);
  let asyncMounted = $state(true);
  let aborted = $state(0);
  let requestId = 0;
  let requests = $state<{ id: number; checked: boolean; resolve: () => void; reject: () => void }[]>([]);
  const setting = createSwitchSetting((next, signal) => new Promise<void>((resolve, reject) => {
    const abort = () => { aborted++; };
    signal.addEventListener('abort', abort, { once: true });
    requests.push({ id: ++requestId, checked: next,
      resolve() { signal.removeEventListener('abort', abort); resolve(); },
      reject() { signal.removeEventListener('abort', abort); reject(new Error('Private save failure')); }
    });
  }));
  const form = createForm<{ enabled: boolean; accepted: boolean }>({
    initialValues: { enabled: false, accepted: false },
    rules: {
      enabled: [{ required: true }],
      accepted: [{ validator: (value) => value === true ? undefined : 'Enable switch consent' }]
    }
  });

  return {
    form,
    setting,
    get checked() { return checked; },
    set checked(value: boolean | undefined) { checked = value; },
    get defaultChecked() { return defaultChecked; },
    get changes() { return JSON.stringify(changes); },
    get clicks() { return clicks; },
    get defaultChanges() { return defaultChanges; },
    change(value: boolean) { changes.push(value); },
    click(event: MouseEvent) { clicks++; if (cancelClick) event.preventDefault(); },
    changeDefault() { defaultChanges++; },
    setChecked() { checked = true; },
    clearChecked() { checked = false; },
    replaceDefault() { defaultChecked = false; },
    get disabled() { return disabled; },
    set disabled(value: boolean) { disabled = value; },
    get loading() { return loading; },
    set loading(value: boolean) { loading = value; },
    get small() { return small; },
    set small(value: boolean) { small = value; },
    get providerSmall() { return providerSmall; },
    set providerSmall(value: boolean) { providerSmall = value; },
    get cancelClick() { return cancelClick; },
    set cancelClick(value: boolean) { cancelClick = value; },
    get cancelReset() { return cancelReset; },
    set cancelReset(value: boolean) { cancelReset = value; },
    get mounted() { return mounted; },
    set mounted(value: boolean) { mounted = value; },
    get dark() { return dark; },
    set dark(value: boolean) { dark = value; },
    get compact() { return compact; },
    set compact(value: boolean) { compact = value; },
    get data() { return data; },
    get submissions() { return submissions; },
    read(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      data = JSON.stringify({ enabled: values.get('enabled'), defaults: values.get('defaultSetting') });
      submissions++;
    },
    reset(event: Event) { if (cancelReset) event.preventDefault(); },
    get externalData() { return externalData; },
    readExternal(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) { event.preventDefault(); externalData = String(new FormData(event.currentTarget).get('outsideSwitch')); },
    get formDisabled() { return formDisabled; },
    set formDisabled(value: boolean) { formDisabled = value; },
    get saved() { return saved; },
    get finishes() { return finishes; },
    finish(values: typeof form.values) { saved = JSON.stringify(values); finishes++; },
    get asyncMounted() { return asyncMounted; },
    get requests() { return requests; },
    get aborted() { return aborted; },
    complete(id: number, success: boolean) {
      const request = requests.find((item) => item.id === id);
      requests = requests.filter((item) => item.id !== id);
      if (success) request?.resolve();
      else request?.reject();
    },
    unmountAsync() { setting.dispose(); asyncMounted = false; },
    dispose() { setting.dispose(); }
  };
}
