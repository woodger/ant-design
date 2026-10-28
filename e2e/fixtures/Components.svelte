<script lang="ts">
  import { ConfigProvider, enUS } from '../../src/lib/components/ant-design';
  import BasicFixtures from './BasicFixtures.svelte';
  import { createControls } from './controls.model.svelte';
  import CheckboxPagination from './CheckboxPagination.svelte';
  import TableFixtures from './TableFixtures.svelte';
  import TableFilterFixtures from './TableFilterFixtures.svelte';
  import ServerTableFixtures from './ServerTableFixtures.svelte';
  import FixedTableFixtures from './FixedTableFixtures.svelte';
  import ExpandableTableFixtures from './ExpandableTableFixtures.svelte';
  import MultipleSelectFixtures from './MultipleSelectFixtures.svelte';
  import CheckboxGroupFixtures from './CheckboxGroupFixtures.svelte';
  import RadioFixtures from './RadioFixtures.svelte';
  import SwitchFixtures from './SwitchFixtures.svelte';
  import InputNumberFixtures from './InputNumberFixtures.svelte';
  import SliderFixtures from './SliderFixtures.svelte';
  import TooltipFixtures from './TooltipFixtures.svelte';
  import PopoverFixtures from './PopoverFixtures.svelte';
  import PopconfirmFixtures from './PopconfirmFixtures.svelte';
  import DropdownFixtures from './DropdownFixtures.svelte';
  import TabsFixtures from './TabsFixtures.svelte';
  import CollapseFixtures from './CollapseFixtures.svelte';
  import DrawerFixtures from './DrawerFixtures.svelte';
  import AlertFixtures from './AlertFixtures.svelte';
  import MessageFixtures from './MessageFixtures.svelte';
  import NotificationFixtures from './NotificationFixtures.svelte';
  import ProgressFixtures from './ProgressFixtures.svelte';
  import SpinFixtures from './SpinFixtures.svelte';
  import SkeletonFixtures from './SkeletonFixtures.svelte';
  import EmptyFixtures from './EmptyFixtures.svelte';
  import ResultFixtures from './ResultFixtures.svelte';
  import StepsFixtures from './StepsFixtures.svelte';
  import TagFixtures from './TagFixtures.svelte';
  import BadgeFixtures from './BadgeFixtures.svelte';
  import AvatarFixtures from './AvatarFixtures.svelte';
  import AvatarGroupFixtures from './AvatarGroupFixtures.svelte';
  import DividerFixtures from './DividerFixtures.svelte';
  import FlexFixtures from './FlexFixtures.svelte';
  import StatisticFixtures from './StatisticFixtures.svelte';
  import StatisticTimerFixtures from './StatisticTimerFixtures.svelte';

  const controls = createControls();
</script>

<style>
  :global(body) { margin: 0; }
  .fixtures { max-width: 800px; padding: 24px; }
  label { display: block; margin-block: 8px; }
</style>

<ConfigProvider componentDisabled={controls.allDisabled} direction={controls.rtl ? 'rtl' : 'ltr'} locale={controls.english ? enUS : undefined}>
  <main class="fixtures">
    <h1>Component browser fixtures</h1>
    <label><input type="checkbox" bind:checked={controls.allDisabled} /> Disable all components</label>
    <label><input type="checkbox" bind:checked={controls.rtl} /> Right to left</label>
    <label><input type="checkbox" bind:checked={controls.english} /> English locale</label>

    <BasicFixtures kind="input" {controls} />

    <BasicFixtures kind="select" {controls} />

    <BasicFixtures kind="select-numeric" {controls} />

    <CheckboxPagination />
    <TableFixtures />
    <TableFilterFixtures />
    <ServerTableFixtures />
    <FixedTableFixtures />
    <ExpandableTableFixtures />
    <MultipleSelectFixtures />
    <CheckboxGroupFixtures />
    <RadioFixtures />
    <SwitchFixtures />
    <InputNumberFixtures />
    <SliderFixtures />
    <TooltipFixtures />
    <PopoverFixtures />
    <PopconfirmFixtures />
    <DropdownFixtures />
    <TabsFixtures />
    <CollapseFixtures />
    <DrawerFixtures />
    <AlertFixtures />
    <MessageFixtures />
    <NotificationFixtures />
    <ProgressFixtures />
    <SpinFixtures />
    <SkeletonFixtures />
    <EmptyFixtures />
    <ResultFixtures />
    <StepsFixtures />
    <TagFixtures />
    <BadgeFixtures />
    <AvatarFixtures />
    <AvatarGroupFixtures />
    <DividerFixtures />
    <FlexFixtures />
    <StatisticFixtures />
    <StatisticTimerFixtures />

    <BasicFixtures kind="form" {controls} />

    <BasicFixtures kind="modal" {controls} />
  </main>
</ConfigProvider>
