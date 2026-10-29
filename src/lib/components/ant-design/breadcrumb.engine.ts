import type { BreadcrumbContent, BreadcrumbItem } from './breadcrumb.types';

export function breadcrumbHasContent(value: BreadcrumbContent | undefined): boolean {
  return value !== undefined && value !== null && value !== false && value !== '';
}
export function breadcrumbItems(items: readonly BreadcrumbItem[] | undefined, routes: readonly BreadcrumbItem[] | undefined): readonly BreadcrumbItem[] {
  if (items) return items;

  return (routes ?? []).map(({ breadcrumbName, children, ...item }) => ({
    title: breadcrumbName,
    ...item,
    ...(children ? { menu: { items: children.map(({ breadcrumbName: name, ...child }) => ({ ...child, title: name })) } } : {})
  }));
}
export function breadcrumbName(title: BreadcrumbContent | undefined, params: Record<string, unknown>): BreadcrumbContent | null {
  if (!breadcrumbHasContent(title)) return null;
  if (typeof title === 'function') return title;

  const keys = Object.keys(params).join('|');
  return String(title).replace(new RegExp(`:(${keys})`, 'g'), (replacement, key: string) => String(params[key] || replacement));
}
export function breadcrumbEntries(items: readonly BreadcrumbItem[], params: Record<string, unknown>) {
  const paths: string[] = [];
  return items.map((item, index) => {
    let path = item.path;
    if (path !== undefined) {
      path = (path || '').replace(/^\//, '');
      for (const key of Object.keys(params)) path = path.replace(`:${key}`, String(params[key]));
      paths.push(path);
    }
    return { item, index, paths: [...paths], href: paths.length && path !== undefined ? `#/${paths.join('/')}` : item.href, title: item.type === 'separator' ? null : breadcrumbName(item.title, params) };
  });
}
export function breadcrumbAttributes(item: BreadcrumbItem): Record<string, unknown> {
  return Object.fromEntries(Object.entries(item).filter(([key]) => key.startsWith('data-') || key.startsWith('aria-')));
}
