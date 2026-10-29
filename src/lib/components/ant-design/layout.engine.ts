import type { GridBreakpoint } from './grid.types';

// Сохраняем dimensionMaxMap из Sider.tsx, включая отличие xxxl от Grid/docs.
export const siderMaxWidths: Record<GridBreakpoint, string> = {
  xs: '479.98px', sm: '575.98px', md: '767.98px', lg: '991.98px',
  xl: '1199.98px', xxl: '1599.98px', xxxl: '1839.98px'
};
export function layoutSiderWidth(value: number | string): string {
  return !Number.isNaN(Number.parseFloat(String(value))) && Number.isFinite(Number(value)) ? `${value}px` : String(value);
}
