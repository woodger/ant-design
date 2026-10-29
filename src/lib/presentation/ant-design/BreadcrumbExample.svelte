<script lang="ts">
  import { Breadcrumb } from '$lib/components/ant-design';
  let project = $state('svelte');
</script>

<label>Проект <input bind:value={project} /></label>
<Breadcrumb aria-label="Путь проекта" params={{ project }} items={[
  { key: 'home', path: 'workspace', title: 'Рабочее пространство' },
  { key: 'project', path: ':project', title: ':project', menu: { items: [{ key: 'components', path: '/components', title: 'Компоненты' }, { key: 'themes', path: '/themes', title: 'Темы' }] }, dropdownProps: { trigger: 'click', 'aria-label': 'Разделы проекта' } },
  { key: 'current', title: 'Библиотека' }
]} />
