<script lang="ts">
  import { Image } from '$lib/components/ant-design';
  const source = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#1677ff"/><circle cx="850" cy="220" r="90" fill="#fff"/><path d="M0 800 400 300 700 700 950 400 1200 800" fill="#0958d9"/></svg>');
</script>
<Image src={source} alt="Пейзаж для просмотра" width={240} />
<p>Откройте изображение для масштабирования, поворота и перемещения.</p>
