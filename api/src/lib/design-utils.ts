// Design utility functions: validation, ID helpers, param coercion
import type { Design } from './types';
import { getLayoutById } from '../layouts';
import { getSizeById } from '../data/size-presets';

// Validate design ID format: must start with "d_" and be at least 10 chars
export function isValidDesignId(id: string): boolean {
  return typeof id === 'string' && /^d_[A-Za-z0-9_-]{8,}$/.test(id);
}

// Coerce all param values to strings (design.params is Record<string, string>)
export function normalizeParams(
  raw: Record<string, unknown>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v !== null && v !== undefined) {
      out[k] = String(v);
    }
  }
  return out;
}

// Check layout exists and supports the given size category
export function isLayoutCompatible(layoutId: string, sizeCategory: string): boolean {
  const layout = getLayoutById(layoutId);
  if (!layout) return false;
  return layout.categories.includes(sizeCategory as any);
}

// Build a shareable URL for a design
export function designShareUrl(origin: string, designId: string): string {
  return `${origin}/d/${designId}`;
}

// Strip internal metadata fields for API responses that only need public shape
export function publicDesign(design: Design): Omit<Design, never> {
  return design;
}

// Derive size category from a preset ID (returns null for unknown presets)
export function sizeCategoryForPreset(presetId: string): string | null {
  const preset = getSizeById(presetId);
  return preset?.category ?? null;
}
