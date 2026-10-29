<script lang="ts">
  import { Image, ImagePreviewGroup } from '$lib/components/ant-design';
  const images = ['#1677ff', '#722ed1', '#13c2c2'].map((color, index) => ({ src: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="${color}"/><circle cx="450" cy="300" r="160" fill="white" opacity="0.6"/><text x="450" y="335" text-anchor="middle" font-size="100">${index + 1}</text></svg>`), alt: `Изображение галереи ${index + 1}` }));
</script>
<div style="display:flex;gap:12px;flex-wrap:wrap"><ImagePreviewGroup>{#each images as image}<Image {...image} width={140} />{/each}</ImagePreviewGroup></div>
