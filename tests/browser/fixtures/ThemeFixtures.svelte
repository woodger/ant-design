<script lang="ts">
  import { Card, ConfigProvider, Divider, Flex } from 'antd-svelte';

  let compact = $state(true);
</script>

<section id="theme-fixture" aria-label="Theme fixture">
  <label><input type="checkbox" bind:checked={compact} /> Compact parent spacing</label>
  <ConfigProvider theme={{ compact }}>
    <Card id="compact-spacing-card"><p>Parent card</p></Card>
    <Flex id="compact-spacing-flex" gap="small"><span>One</span><span>Two</span></Flex>
    <Divider id="compact-spacing-divider" />
    <ConfigProvider><Card id="inherited-spacing-card"><p>Inherited card</p></Card></ConfigProvider>
    <ConfigProvider theme={{ compact: false }}>
      <Card id="normal-spacing-card"><p>Normal child card</p></Card>
      <Flex id="normal-spacing-flex" gap="small"><span>One</span><span>Two</span></Flex>
    </ConfigProvider>
    <ConfigProvider theme={{ compact: false }} style="--ant-padding-lg:30px">
      <Card id="custom-spacing-card"><p>Custom child card</p></Card>
    </ConfigProvider>
  </ConfigProvider>
</section>
