// All size presets from PRD (13 platform presets + custom)
import type { SizePreset } from '../lib/types';

export const SIZE_PRESETS: SizePreset[] = [
  // Landscape (~16:9, 1.91:1)
  { id: 'fb-post', name: 'Facebook Post', w: 1200, h: 630, category: 'landscape' },
  { id: 'og-image', name: 'OG Image', w: 1200, h: 630, category: 'landscape' },
  { id: 'zalo-post', name: 'Zalo Post', w: 1200, h: 630, category: 'landscape' },
  { id: 'tw-post', name: 'Twitter/X Post', w: 1200, h: 675, category: 'landscape' },
  { id: 'yt-thumbnail', name: 'YouTube Thumbnail', w: 1280, h: 720, category: 'landscape' },
  { id: 'blog-hero', name: 'Blog Hero', w: 1600, h: 900, category: 'landscape' },
  { id: 'agency-wide', name: 'Agency Wide', w: 1300, h: 874, category: 'landscape' },
  { id: 'ig-landscape', name: 'Instagram Landscape', w: 1080, h: 566, category: 'landscape' },

  // Square (1:1)
  { id: 'ig-post', name: 'Instagram Post', w: 1080, h: 1080, category: 'square' },

  // Portrait (9:16)
  { id: 'fb-story', name: 'Facebook Story', w: 1080, h: 1920, category: 'portrait' },
  { id: 'ig-story', name: 'Instagram Story', w: 1080, h: 1920, category: 'portrait' },

  // Wide (ultra-wide)
  { id: 'fb-cover', name: 'Facebook Cover', w: 1640, h: 924, category: 'wide' },
  { id: 'yt-banner', name: 'YouTube Banner', w: 2560, h: 1440, category: 'wide' },
];

export const SIZE_CATEGORIES = ['landscape', 'square', 'portrait', 'wide'] as const;

export function getSizeById(id: string): SizePreset | undefined {
  return SIZE_PRESETS.find(s => s.id === id);
}

export function getSizesByCategory(category: SizePreset['category']): SizePreset[] {
  return SIZE_PRESETS.filter(s => s.category === category);
}

export function createCustomSize(w: number, h: number): SizePreset {
  const ratio = w / h;
  let category: SizePreset['category'] = 'landscape';
  if (ratio < 0.7) category = 'portrait';
  else if (ratio > 0.9 && ratio < 1.1) category = 'square';
  else if (ratio > 2) category = 'wide';

  return { id: 'custom', name: `Custom (${w}×${h})`, w, h, category };
}
