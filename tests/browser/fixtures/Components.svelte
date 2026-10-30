<script lang="ts">
  import TextAreaFeaturesFixtures from './TextAreaFeaturesFixtures.svelte';
  import WatermarkFixtures from './WatermarkFixtures.svelte';
  import RateFixtures from './RateFixtures.svelte';
  import ImageGroupFixtures from './ImageGroupFixtures.svelte';
  import ImageFixtures from './ImageFixtures.svelte';
  import MentionsFixtures from './MentionsFixtures.svelte';
  import AutoCompleteFixtures from './AutoCompleteFixtures.svelte';
  import { ConfigProvider, enUS } from 'antd-svelte';
  import MenuFixtures from './MenuFixtures.svelte';
  import TreeSelectFixtures from './TreeSelectFixtures.svelte';
  import TreeFixtures from './TreeFixtures.svelte';
  import UploadFixtures from './UploadFixtures.svelte';
  import RangePickerFixtures from './RangePickerFixtures.svelte';
  import DatePickerFixtures from './DatePickerFixtures.svelte';
  import RemoteSelectFixtures from './RemoteSelectFixtures.svelte';
  import TextAreaFixtures from './TextAreaFixtures.svelte';
  import InputFeaturesFixtures from './InputFeaturesFixtures.svelte';
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
  import SegmentedFixtures from './SegmentedFixtures.svelte';
  import GridFixtures from './GridFixtures.svelte';
  import DescriptionsFixtures from './DescriptionsFixtures.svelte';
  import CardFixtures from './CardFixtures.svelte';
  import BreadcrumbFixtures from './BreadcrumbFixtures.svelte';
  import ThemeFixtures from './ThemeFixtures.svelte';
  import SpaceCompactFixtures from './SpaceCompactFixtures.svelte';
  import StepsVariantsFixtures from './StepsVariantsFixtures.svelte';
  import FloatButtonFixtures from './FloatButtonFixtures.svelte';
  import ButtonFixtures from './ButtonFixtures.svelte';
  import TimelineFixtures from './TimelineFixtures.svelte';
  import AnchorFixtures from './AnchorFixtures.svelte';
  import AffixFixtures from './AffixFixtures.svelte';
  import SpaceFixtures from './SpaceFixtures.svelte';
  import LayoutFixtures from './LayoutFixtures.svelte';

  const controls = createControls();
</script>

<style>
  :global(body) { margin: 0; }
  .fixtures { max-width: 800px; padding: 24px; }
  label { display: block; margin-block: 8px; }
</style>

<ConfigProvider
  componentDisabled={controls.allDisabled}
  direction={controls.rtl ? 'rtl' : 'ltr'}
  locale={controls.english ? enUS : undefined}
>
  <main class="fixtures">
    <h1>Component browser fixtures</h1>
    <label><input type="checkbox" bind:checked={controls.allDisabled} /> Disable all components</label>
    <label><input type="checkbox" bind:checked={controls.rtl} /> Right to left</label>
    <label><input type="checkbox" bind:checked={controls.english} /> English locale</label>

    <ImageGroupFixtures />
    <ImageFixtures />
    <MentionsFixtures />
    <AutoCompleteFixtures />
    <MenuFixtures />
    <TreeSelectFixtures />
    <TreeFixtures />
    <UploadFixtures />
    <RangePickerFixtures />
    <DatePickerFixtures />
    <RemoteSelectFixtures />
    <RateFixtures />
    <WatermarkFixtures />
    <TextAreaFeaturesFixtures />
    <TextAreaFixtures />
    <InputFeaturesFixtures />
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
    <SegmentedFixtures />
    <GridFixtures />
    <LayoutFixtures />
    <StepsVariantsFixtures />
    <FloatButtonFixtures />
    <ButtonFixtures />
    <TimelineFixtures />
    <AnchorFixtures />
    <AffixFixtures />
    <SpaceFixtures />
    <SpaceCompactFixtures />
    <ThemeFixtures />
    <BreadcrumbFixtures />
    <CardFixtures />
    <DescriptionsFixtures />

    <BasicFixtures kind="form" {controls} />

    <BasicFixtures kind="modal" {controls} />
  </main>
</ConfigProvider>
