// Route handler for GET /api/sizes — returns all size presets with category groupings
import { jsonResponse } from '../lib/response-helpers';
import { SIZE_PRESETS } from '../data/size-presets';

// Build category → id[] map from SIZE_PRESETS
function buildCategories(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const preset of SIZE_PRESETS) {
    if (!map[preset.category]) map[preset.category] = [];
    map[preset.category].push(preset.id);
  }
  return map;
}

// GET /api/sizes
export function handleSizes(): Response {
  return jsonResponse({
    sizes: SIZE_PRESETS.map(s => ({
      id: s.id,
      name: s.name,
      width: s.w,
      height: s.h,
      category: s.category,
    })),
    categories: buildCategories(),
  });
}
