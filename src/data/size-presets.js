// Size presets for thumbnail generation
// MVP: 3 presets covering landscape and square categories
export const SIZE_PRESETS = [
  { id: 'fb-post', name: 'Facebook Post', w: 1200, h: 630, category: 'landscape' },
  { id: 'ig-post', name: 'Instagram Post', w: 1080, h: 1080, category: 'square' },
  { id: 'yt-thumbnail', name: 'YouTube Thumbnail', w: 1280, h: 720, category: 'landscape' },
];

export function getSizeById(id) {
  return SIZE_PRESETS.find(s => s.id === id);
}
